'use strict';

let Q = require('q');

module.exports = {
  test(pool) {
    let q = Q.defer();

    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select cl.labtest as LABNAME, l.LABRESULT
          from labfu as l
          left join clabtest as cl on cl.id_labtest=l.LABTEST
          limit 10`;

        conn.query(sql, (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  }
}