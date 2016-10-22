'use strict';

let Q = require('q');

module.exports = {
  getLabGroup(pool) {
    let q = Q.defer();

    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select * from lab_items_group`;

        conn.query(sql, (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  }, 

  getLabItems(pool, groupId) {
    let q = Q.defer();

    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select lab_items_code, lab_items_name,
          lab_items_unit, lab_items_normal_value
          from lab_items 
          where lab_items_group=?
          order by lab_items_name`;

        conn.query(sql, [groupId], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  }
}