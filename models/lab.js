'use strict';

let Q = require('q');
let moment = require('moment');

module.exports = {
  saveOrder(pool, hospcode, userId, person) {
    let q = Q.defer();
    let order_date = moment().format('YYYY-MM-DD');
    let order_time = moment().format('HH:mm:ss');

    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = "insert into orders (order_date, order_time, hospcode, user_id, person_cid, person_fullname, person_address) VALUES (?, ?, ?, ?, ?, ?, ?)";
        conn.query(sql, [order_date, order_time, hospcode, userId, person.cid, person.fullname, person.fulladdress], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows.insertId)
        });

        conn.release()
      }
    });

    return q.promise;
  },

  saveOrderDetail(pool, orderId, labItems) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = "insert into order_detail (order_id, lab_items_code) VALUES ?";
        let items = [];
        labItems.forEach(v => {
          let _i = [orderId, v]
          items.push(_i);
        })

        conn.query(sql, [items], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve()
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getOrderList(pool, hospcode, status) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select o.order_id, o.order_date, o.order_time, o.confirm_status, 
          o.person_fullname, o.person_cid, o.person_address, o.person_cid, o.hos_vn,
          (select count(*) from order_detail where order_id=o.order_id) as items
          from orders as o
          where o.hospcode=? order by o.order_date, o.order_time desc limit 100`;

        conn.query(sql, [hospcode], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getLabOrderDetail(pool, orderId) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `SELECT o.*, h.hospname
          from orders as o
          left join chospcode as h on h.hospcode=o.hospcode
          where order_id=?`;

        conn.query(sql, [orderId], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows[0])
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getLabResult(pool, vn) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select li.lab_items_name, lo.lab_order_result, li.lab_items_unit, lh.order_date, 
        lh.order_time, li.lab_items_normal_value
        from lab_head as lh
        inner join lab_order as lo on lo.lab_order_number=lh.lab_order_number
        inner join lab_items as li on li.lab_items_code=lo.lab_items_code
        where lh.vn=?
        and lo.lab_order_result<>''`;

        conn.query(sql, [vn], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  },

  getDateOrderList(pool, hospcode) {
    let q = Q.defer();
    pool.getConnection((err, conn) => {
      if (err) {
        console.log(err)
        q.reject(err)
      } else {
        let sql = `select distinct order_date 
          from orders
          where hospcode=?
          order by order_date desc
          limit 30`;

        conn.query(sql, [hospcode], (err, rows) => {
          console.dir(err)
          if (err) q.reject(err);
          else q.resolve(rows)
        });

        conn.release()
      }
    });

    return q.promise;
  }
}