'use strict';

let express = require('express');
let router = express.Router();
let moment = require('moment');

let hdc = require('../models/hdc')

/* GET home page. */
router.post('/hdc/services', (req, res, next) => {
  let pool = req.hdcPool;
  let cid = req.body.cid;
  // console.log(cid);
  if (cid) {
    // get hpids
    hdc.getHPID(pool, cid)
      .then(hpids => {
        // console.log(hpids)
        if (hpids) {
          let _hpids = [];
          let _services = [];
          // perform hpids
          hpids.forEach(v => {
            _hpids.push(v.hpid)
          });
          // console.log(_hpids)
          // get service history
          hdc.getServices(pool, _hpids)
            .then(rows => {
              // console.log(rows)
              // rows.forEach(v => {
              //   let obj = {};
              //   obj.HOSPCODE = v.HOSPCODE;
              //   obj.SEQ = v.SEQ;
              //   obj.PID = v.PID;
              //   obj.LABS = v.LABS;
              //   obj.AN = v.AN;
              //   obj.ORG_DATE_SERV = v.DATE_SERV;
              //   obj.DATE_SERV = `${moment(v.DATE_SERV).format('DD/MM')}/${moment(v.DATE_SERV).get('year') + 543}`;
              //   obj.TIME_SERV = moment(v.TIME_SERV, 'HH:mm:ss').format('HH:mm');
              //   obj.HOSPNAME = v.HOSPNAME;

              //   _services.push(obj)
              // });

              res.send({ ok: true, rows: rows });
            }, err => {
              console.log(err)
              res.send({ ok: false, msg: err });
            });
        } else {
          res.send({ok: false, msg: 'ไม่พบประวัติรับบริการ'})
        }
      }, err => {
        res.send({ ok: false, msg: err });
      });
  } else {
    res.send({ok: false, msg: 'ไม่พบ เลขบัตรประชาชน'})
  }
});

router.post('/hdc/screen', (req, res, next) => {
  let pool = req.hdcPool;
  let hospcode = req.body.hospcode;
  let pid = req.body.pid;
  let seq = req.body.seq;

  hdc.getScreenData(pool, hospcode, pid, seq)
    .then(screen => {
      res.send({ ok: true, screen: screen });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/hdc/drug-opd', (req, res, next) => {
  let pool = req.hdcPool;
  let hospcode = req.body.hospcode;
  let pid = req.body.pid;
  let seq = req.body.seq;

  hdc.getDrugOPD(pool, hospcode, pid, seq)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/hdc/drug-ipd', (req, res, next) => {
  let pool = req.hdcPool;
  let hospcode = req.body.hospcode;
  let pid = req.body.pid;
  let an = req.body.an;

  hdc.getDrugIPD(pool, hospcode, pid, an)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/hdc/lab', (req, res, next) => {
  let pool = req.hdcPool;
  let hospcode = req.body.hospcode;
  let pid = req.body.pid;
  let seq = req.body.seq;

  hdc.getLab(pool, hospcode, pid, seq)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/hdc/admission', (req, res, next) => {
  let pool = req.hdcPool;
  let hospcode = req.body.hospcode;
  let pid = req.body.pid;
  let an = req.body.an;

  console.log(req.body);

  hdc.getAdmission(pool, hospcode, pid, an)
    .then(admission => {
      res.send({ ok: true, admission: admission });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/hdc/efs', (req, res, next) => {
  let pool = req.hdcPool;
  let hospcode = req.body.hospcode;
  let pid = req.body.pid;
  let seq = req.body.seq;

  console.log(req.body);

  hdc.getEFS(pool, hospcode, pid, seq)
    .then(efs => {
      res.send({ ok: true, efs: efs });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

// router.get('/test', (req, res, next) => {
//   hdc.test(req.hdcPool)
//     .then(rows => {
//       res.send({ ok: true, rows: rows })
//     }, err => {
//       res.send({ ok: false, msg: err })
//     });
// });



module.exports = router;
