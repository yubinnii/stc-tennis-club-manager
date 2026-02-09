const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('데이터베이스 초기화 중...');

// 모든 테이블 삭제
db.serialize(() => {
  db.run('DROP TABLE IF EXISTS matches');
  db.run('DROP TABLE IF EXISTS canball_user');
  db.run('DROP TABLE IF EXISTS canball_pool');
  db.run('DROP TABLE IF EXISTS approvals');
  db.run('DROP TABLE IF EXISTS users', (err) => {
    if (err) {
      console.error('테이블 삭제 중 오류:', err);
    } else {
      console.log('✅ 모든 테이블이 삭제되었습니다.');
      console.log('서버를 다시 시작하면 새로운 테이블이 자동으로 생성됩니다.');
    }
    db.close();
  });
});
