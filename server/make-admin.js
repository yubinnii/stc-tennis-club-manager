const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('관리자 권한 부여 중...');

// 먼저 가장 최근 일반 회원 찾기
db.get(
  `SELECT id FROM users WHERE role = 'member' ORDER BY id DESC LIMIT 1`,
  (err, row) => {
    if (err) {
      console.error('❌ 오류 발생:', err);
      db.close();
      return;
    }
    
    if (!row) {
      console.log('⚠️ 변경할 일반 회원이 없습니다.');
      db.close();
      return;
    }

    // 해당 회원을 관리자로 변경
    const userId = row.id;
    db.run(
      `UPDATE users SET role = 'admin', isAdmin = 1 WHERE id = ?`,
      [userId],
      function(err) {
        if (err) {
          console.error('❌ 오류 발생:', err);
        } else if (this.changes > 0) {
          console.log('✅ 1명의 회원이 관리자로 변경되었습니다.');
          
          // 변경된 사용자 정보 확인
          db.get(
            `SELECT id, name, role, isAdmin FROM users WHERE id = ?`,
            [userId],
            (err, row) => {
              if (row) {
                console.log(`   이름: ${row.name}`);
                console.log(`   역할: ${row.role}`);
                console.log(`   isAdmin: ${row.isAdmin}`);
              }
              db.close();
            }
          );
        }
      }
    );
  }
);
