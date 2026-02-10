const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    studentId TEXT UNIQUE,
    password TEXT,
    rank INTEGER,
    tier TEXT,
    singlesPoint INTEGER,
    doublesPoint INTEGER,
    isAdmin INTEGER,
    avatar TEXT,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'pending'
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    studentId TEXT,
    role TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT,
    avatar TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS canball_pool (
    id TEXT PRIMARY KEY,
    year INTEGER,
    month INTEGER,
    available INTEGER DEFAULT 0,
    createdAt TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS canball_user (
    id TEXT PRIMARY KEY,
    userId TEXT,
    year INTEGER,
    month INTEGER,
    createdAt TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    type TEXT,
    winnerId TEXT,
    loserId TEXT,
    winnerIdSecond TEXT,
    loserIdSecond TEXT,
    score TEXT,
    createdAt TEXT
  )`);
});

// Migration: Add status column to approvals if it doesn't exist
setTimeout(() => {
  db.all(`PRAGMA table_info(approvals)`, (err, columns) => {
    if (err) {
      console.error('Migration check failed:', err);
      return;
    }
    const hasStatus = columns && columns.some(col => col.name === 'status');
    if (!hasStatus) {
      console.log('⏳ Adding status column to approvals table...');
      db.run(`ALTER TABLE approvals ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
        if (err) {
          console.error('❌ Migration failed:', err);
        } else {
          console.log('✓ Status column added successfully');
          // Update existing records
          db.run(`UPDATE approvals SET status = 'pending' WHERE status IS NULL`, (err) => {
            if (!err) console.log('✓ Existing records updated');
          });
        }
      });
    } else {
      console.log('✓ Status column already exists');
      // Update any NULL values
      db.run(`UPDATE approvals SET status = 'pending' WHERE status IS NULL`, (err) => {
        if (!err) console.log('✓ NULL values updated to pending');
      });
    }
  });
}, 500);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Frontend 빌드 결과 제공
const distPath = path.join(__dirname, '../dist');
try {
  const fs = require('fs');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }
} catch (e) {
  console.log('dist 폴더를 찾을 수 없습니다.');
}

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/signup', (req, res) => {
  const { name, studentId, password, role } = req.body;
  if (!studentId || !name || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const userRole = role || 'member';
  const status = userRole === 'admin' ? 'pending' : 'approved';
  const userId = `user_${Date.now()}`;
  const avatar = `${req.protocol}://${req.get('host')}/default-profile.png`;

  db.run(
    `INSERT INTO users (id, name, studentId, password, rank, tier, singlesPoint, doublesPoint, isAdmin, avatar, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, studentId, password, 999, 'Silver', 1500, 1500, userRole === 'admin' ? 1 : 0, avatar, userRole, status],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'exists' });
        }
        return res.status(500).json({ error: 'db_error' });
      }
      
      if (userRole === 'admin') {
        const approvalId = `appr_${Date.now()}`;
        db.run(
          `INSERT INTO approvals (id, userId, name, studentId, role, createdAt, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [approvalId, userId, name, studentId, userRole, new Date().toISOString(), avatar],
          (err2) => {
            if (err2) console.error(err2);
            return res.status(201).json({ id: userId, name, studentId, role: userRole, status });
          }
        );
      } else {
        return res.status(201).json({ id: userId, name, studentId, role: userRole, status });
      }
    }
  );
});

app.post('/login', (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  db.get(`SELECT * FROM users WHERE studentId = ?`, [studentId], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(401).json({ error: 'not_found' });
    if (row.password !== password) return res.status(401).json({ error: 'invalid_credentials' });
    
    if (row.status === 'pending') {
      return res.status(403).json({ error: 'pending_approval' });
    }

    const user = {
      id: row.id,
      name: row.name,
      studentId: row.studentId,
      rank: row.rank,
      tier: row.tier,
      singlesPoint: row.singlesPoint,
      doublesPoint: row.doublesPoint,
      isAdmin: !!row.isAdmin,
      avatar: row.avatar,
      role: row.role,
      status: row.status
    };
    res.json(user);
  });
});

app.get('/approvals', (req, res) => {
  db.all(`SELECT * FROM approvals WHERE status IS NULL OR status = 'pending' ORDER BY createdAt DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows || []);
  });
});

app.get('/approvals/all', (req, res) => {
  db.all(`SELECT * FROM approvals ORDER BY createdAt DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows || []);
  });
});

app.post('/approvals/:approvalId/approve', (req, res) => {
  const { approvalId } = req.params;
  db.get(`SELECT * FROM approvals WHERE id = ?`, [approvalId], (err, appr) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!appr) return res.status(404).json({ error: 'not_found' });
    
    db.run(`UPDATE users SET status = ? WHERE id = ?`, ['approved', appr.userId], (err2) => {
      if (err2) return res.status(500).json({ error: 'db_error' });
      db.run(`UPDATE approvals SET status = ? WHERE id = ?`, ['approved', approvalId], (err3) => {
        if (err3) return res.status(500).json({ error: 'db_error' });
        res.json({ success: true });
      });
    });
  });
});

app.post('/approvals/:approvalId/reject', (req, res) => {
  const { approvalId } = req.params;
  db.get(`SELECT * FROM approvals WHERE id = ?`, [approvalId], (err, appr) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!appr) return res.status(404).json({ error: 'not_found' });
    
    db.run(`DELETE FROM users WHERE id = ?`, [appr.userId], (err2) => {
      if (err2) return res.status(500).json({ error: 'db_error' });
      db.run(`UPDATE approvals SET status = ? WHERE id = ?`, ['rejected', approvalId], (err3) => {
        if (err3) return res.status(500).json({ error: 'db_error' });
        res.json({ success: true });
      });
    });
  });
});

// User endpoints
app.get('/users/list', (req, res) => {
  db.all(`SELECT id, name, studentId, avatar FROM users WHERE status = 'approved'`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows || []);
  });
});

app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  db.get(`SELECT id, name, studentId, rank, tier, singlesPoint, doublesPoint, isAdmin, avatar, role, status FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json(row);
  });
});

// Update avatar (expects { avatar: '<dataUrl>' })
app.post('/users/:userId/avatar', (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body;
  if (!avatar) return res.status(400).json({ error: 'missing_avatar' });
  db.run(`UPDATE users SET avatar = ? WHERE id = ?`, [avatar, userId], function(err) {
    if (err) return res.status(500).json({ error: 'db_error' });
    db.get(`SELECT id, name, studentId, rank, tier, singlesPoint, doublesPoint, isAdmin, avatar, role, status FROM users WHERE id = ?`, [userId], (err2, row) => {
      if (err2) return res.status(500).json({ error: 'db_error' });
      res.json(row);
    });
  });
});

// Canball endpoints
app.get('/canball/:userId', (req, res) => {
  const { userId } = req.params;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Get user's receipt status
  db.get(`SELECT * FROM canball_user WHERE userId = ? AND year = ? AND month = ?`, [userId, year, month], (err, userRow) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    
    // Get pool available count
      db.get(`SELECT available, id FROM canball_pool ORDER BY createdAt DESC LIMIT 1`, [], (err2, poolRow) => {
      if (err2) return res.status(500).json({ error: 'db_error' });
      
      res.json({ 
        canBallCount: poolRow ? poolRow.available : 0,
        received: !!userRow,
        month 
      });
    });
  });
});

app.post('/canball/:userId/receive', (req, res) => {
  const { userId } = req.params;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Check if already received
  db.get(`SELECT * FROM canball_user WHERE userId = ? AND year = ? AND month = ?`, [userId, year, month], (err, userRow) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (userRow) return res.status(400).json({ error: 'already_received' });

    // Check pool availability
      db.get(`SELECT * FROM canball_pool ORDER BY createdAt DESC LIMIT 1`, [], (err2, poolRow) => {
      if (err2) return res.status(500).json({ error: 'db_error' });
      
      if (!poolRow || poolRow.available <= 0) {
        return res.status(400).json({ error: 'no_canball_available' });
      }

      // Add user receipt record
      const userId_rec = `cu_${Date.now()}`;
      db.run(
        `INSERT INTO canball_user (id, userId, year, month, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [userId_rec, userId, year, month, new Date().toISOString()],
        (err3) => {
          if (err3) return res.status(500).json({ error: 'db_error' });
          
          // Decrease pool available count
          // decrease the latest pool's available count
          const targetPoolId = poolRow.id;
          db.run(
            `UPDATE canball_pool SET available = available - 1 WHERE id = ?`,
            [targetPoolId],
            (err4) => {
              if (err4) return res.status(500).json({ error: 'db_error' });
              res.json({ success: true });
            }
          );
        }
      );
    });
  });
});

app.post('/canball/:userId/adjust', (req, res) => {
  const { amount } = req.body;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Use global pool (latest record)
  db.get(`SELECT * FROM canball_pool ORDER BY createdAt DESC LIMIT 1`, [], (err, poolRow) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    
    if (!poolRow) {
      // Create new pool record with adjusted amount
      const poolId = `cp_${Date.now()}`;
      const newCount = Math.max(0, amount);
      db.run(
        `INSERT INTO canball_pool (id, available, createdAt) VALUES (?, ?, ?)`,
        [poolId, newCount, new Date().toISOString()],
        (err2) => {
          if (err2) return res.status(500).json({ error: 'db_error' });
          res.json({ success: true, count: newCount });
        }
      );
    } else {
      // Update existing pool record
      const newCount = Math.max(0, poolRow.available + amount);
      db.run(
        `UPDATE canball_pool SET available = ? WHERE id = ?`,
        [newCount, poolRow.id],
        (err2) => {
          if (err2) return res.status(500).json({ error: 'db_error' });
          res.json({ success: true, count: newCount });
        }
      );
    }
  });
});

app.get('/canball/received/:year/:month', (req, res) => {
  const { year, month } = req.params;
  
  db.all(`
    SELECT cu.userId, u.name, u.avatar, cu.createdAt
    FROM canball_user cu
    JOIN users u ON cu.userId = u.id
    WHERE cu.year = ? AND cu.month = ?
    ORDER BY cu.createdAt DESC
  `, [year, month], (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows || []);
  });
});

// Match endpoints
// 스코어에 따라 점수 계산 함수
const calculatePoints = (type, score) => {
  // score 형식: "6-0", "6-1" 등
  const parts = score.split('-').map(s => parseInt(s.trim()));
  if (parts.length !== 2) return type === 'Singles' ? 30 : 10;
  
  const [winnerScore, loserScore] = parts;
  
  if (type === 'Singles') {
    // 단식: 기본 ±30
    switch (loserScore) {
      case 0: return 45;  // 6–0
      case 1: return 41;  // 6–1
      case 2: return 36;  // 6–2
      case 3: return 30;  // 6–3
      case 4: return 24;  // 6–4
      case 5: return 18;  // 6–5
      default: return 30; // 기본값
    }
  } else {
    // 복식: 기본 ±10
    switch (loserScore) {
      case 0: return 15;  // 6–0
      case 1: return 14;  // 6–1
      case 2: return 12;  // 6–2
      case 3: return 10;  // 6–3
      case 4: return 8;   // 6–4
      case 5: return 6;   // 6–5
      default: return 10; // 기본값
    }
  }
};

app.post('/matches', (req, res) => {
  const { type, winnerId, loserId, winnerIdSecond, loserIdSecond, score } = req.body;
  
  if (!type || !winnerId || !loserId || !score) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const matchId = `m_${Date.now()}`;
  const pointChange = calculatePoints(type, score);

  db.run(
    `INSERT INTO matches (id, type, winnerId, loserId, winnerIdSecond, loserIdSecond, score, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [matchId, type, winnerId, loserId, winnerIdSecond || null, loserIdSecond || null, score, new Date().toISOString()],
    (err) => {
      if (err) return res.status(500).json({ error: 'db_error' });

      const colName = type === 'Singles' ? 'singlesPoint' : 'doublesPoint';
      
      // 승자들 점수 업데이트
      db.run(`UPDATE users SET ${colName} = ${colName} + ? WHERE id = ?`, [pointChange, winnerId], (err2) => {
        if (err2) return res.status(500).json({ error: 'db_error' });
        
        // 복식인 경우 승자2도 업데이트
        const updateWinner2 = () => {
          if (type === 'Doubles' && winnerIdSecond) {
            db.run(`UPDATE users SET ${colName} = ${colName} + ? WHERE id = ?`, [pointChange, winnerIdSecond], updateLoser);
          } else {
            updateLoser();
          }
        };
        
        // 패자들 점수 업데이트
        const updateLoser = () => {
          db.run(`UPDATE users SET ${colName} = ${colName} - ? WHERE id = ?`, [pointChange, loserId], (err3) => {
            if (err3) return res.status(500).json({ error: 'db_error' });
            
            // 복식인 경우 패자2도 업데이트
            const updateLoser2 = () => {
              if (type === 'Doubles' && loserIdSecond) {
                db.run(`UPDATE users SET ${colName} = ${colName} - ? WHERE id = ?`, [pointChange, loserIdSecond], updateTiers);
              } else {
                updateTiers();
              }
            };
            
            // 모든 선수의 티어 업데이트
            const updateTiers = () => {
              updateTier(winnerId, colName);
              if (type === 'Doubles' && winnerIdSecond) {
                updateTier(winnerIdSecond, colName);
              }
              updateTier(loserId, colName);
              if (type === 'Doubles' && loserIdSecond) {
                updateTier(loserIdSecond, colName);
              }
              res.status(201).json({ id: matchId });
            };
            
            updateLoser2();
          });
        };
        
        updateWinner2();
      });
    }
  );
});

const updateTier = (userId, pointCol) => {
  db.get(`SELECT ${pointCol} FROM users WHERE id = ?`, [userId], (err, row) => {
    if (!err && row) {
      const points = row[pointCol];
      let tier = 'Bronze';
      if (points >= 1550) tier = 'Gold';
      else if (points >= 1450) tier = 'Silver';

      db.run(`UPDATE users SET tier = ? WHERE id = ?`, [tier, userId], (err2) => {
        if (err2) console.error(err2);
      });
    }
  });
};

app.get('/matches', (req, res) => {
  db.all(`SELECT * FROM matches ORDER BY createdAt DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    
    const promises = (rows || []).map(m => 
      new Promise(resolve => {
        db.get(`SELECT name FROM users WHERE id = ?`, [m.winnerId], (e1, w1) => {
          db.get(`SELECT name FROM users WHERE id = ?`, [m.loserId], (e2, w2) => {
            db.get(`SELECT name FROM users WHERE id = ?`, [m.winnerIdSecond], (e3, w3) => {
              db.get(`SELECT name FROM users WHERE id = ?`, [m.loserIdSecond], (e4, w4) => {
                resolve({
                  ...m,
                  winnerName: w1?.name || 'Unknown',
                  loserName: w2?.name || 'Unknown',
                  winnerNameSecond: w3?.name || null,
                  loserNameSecond: w4?.name || null
                });
              });
            });
          });
        });
      })
    );

    Promise.all(promises).then(results => res.json(results));
  });
});

app.delete('/matches/:matchId', (req, res) => {
  const { matchId } = req.params;
  db.get(`SELECT * FROM matches WHERE id = ?`, [matchId], (err, match) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!match) return res.status(404).json({ error: 'not_found' });

    const pointChange = match.type === 'Singles' ? 30 : 10;
    const colName = match.type === 'Singles' ? 'singlesPoint' : 'doublesPoint';

    db.run(`UPDATE users SET ${colName} = ${colName} - ? WHERE id = ?`, [pointChange, match.winnerId], (err2) => {
      if (err2) return res.status(500).json({ error: 'db_error' });
      db.run(`UPDATE users SET ${colName} = ${colName} + ? WHERE id = ?`, [pointChange, match.loserId], (err3) => {
        if (err3) return res.status(500).json({ error: 'db_error' });
        db.run(`DELETE FROM matches WHERE id = ?`, [matchId], (err4) => {
          if (err4) return res.status(500).json({ error: 'db_error' });
          
          updateTier(match.winnerId, colName);
          updateTier(match.loserId, colName);
          
          res.json({ success: true });
        });
      });
    });
  });
});

// Ranking endpoints
app.get('/ranking/:type', (req, res) => {
  const { type } = req.params;
  const col = type === 'singles' ? 'singlesPoint' : 'doublesPoint';
  db.all(`SELECT id, name, studentId, tier, ${col} as points, avatar FROM users WHERE status = 'approved' ORDER BY ${col} DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json((rows || []).map((r, i) => ({ ...r, rank: i + 1 })));
  });
});

app.post('/ranking/reset', (req, res) => {
  db.all(`SELECT id, singlesPoint, doublesPoint FROM users WHERE status = 'approved'`, (err, users) => {
    if (err) return res.status(500).json({ error: 'db_error' });

    let completed = 0;
    users.forEach(u => {
      const newSingles = 1500 + (u.singlesPoint - 1500) * 0.5;
      const newDoubles = 1500 + (u.doublesPoint - 1500) * 0.5;
      
      db.run(
        `UPDATE users SET singlesPoint = ?, doublesPoint = ? WHERE id = ?`,
        [Math.round(newSingles), Math.round(newDoubles), u.id],
        (err2) => {
          if (!err2) {
            updateTier(u.id, 'singlesPoint');
            updateTier(u.id, 'doublesPoint');
          }
          completed++;
          if (completed === users.length) {
            res.json({ success: true });
          }
        }
      );
    });
  });
});

// SPA 라우팅: 모든 정의되지 않은 경로를 index.html로 리다이렉트
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  try {
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
