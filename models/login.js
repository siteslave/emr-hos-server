'use strict';

let Q = require('q');

module.exports = {
  auth(pool, username) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `SELECT * FROM users WHERE username=? and user_type="2"`;
        conn.query(sql, [username], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows[0])
        });
      }
      conn.release();
    });

    return q.promise;
  },

  authLab(pool, username) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `SELECT * FROM users WHERE username=? and user_type="3"`;
        conn.query(sql, [username], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows[0])
        });
      }
      conn.release();
    });

    return q.promise;
  }
}