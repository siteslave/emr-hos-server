'use strict';

let express = require('express');
let router = express.Router();
let moment = require('moment');
let rimraf = require('rimraf');
let fse = require('fs-extra');
let fs = require('fs');
let path = require('path');
let pdf = require('html-pdf');
let jsonData = require('gulp-data');
let gulp = require('gulp');
let jade = require('gulp-jade');

let hdc = require('../models/hdc')
let hos = require('../models/hos')
let lab = require('../models/lab')
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

//------ HOSxP --------//

router.post('/hos/lab-group', (req, res, next) => {
  let pool = req.hosPool;

  hos.getLabGroup(pool)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/hos/lab-items', (req, res, next) => {
  let pool = req.hosPool;
  let groupId = req.body.groupId;

  hos.getLabItems(pool, groupId)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

// LABS

router.post('/lab/save', (req, res, next) => {
  let pool = req.iLabPool;
  let labItems = req.body.labItems;
  let hospcode = req.body.hospcode;
  let person = req.body.person;

  // console.log(req.decoded)
  let userId = req.decoded.id;
  
  lab.saveOrder(pool, hospcode, userId, person)
    .then(orderId => {
      return lab.saveOrderDetail(pool, orderId, labItems);
    })
    .then(() => { 
      res.send({ok: true})
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/lab/list', (req, res, next) => {
  let pool = req.iLabPool;
  let status = req.body.status || 'N';
  let hospcode = req.body.hospcode;

  lab.getOrderList(pool, hospcode, status)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      console.log(err);
      res.send({ ok: false, msg: err });
    });
})

router.post('/lab/list-by-date', (req, res, next) => {
  let pool = req.iLabPool;
  let hospcode = req.body.hospcode;
  let date = req.body.date;

  lab.getOrderListByDate(pool, hospcode, date)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      console.log(err);
      res.send({ ok: false, msg: err });
    });
})

router.post('/lab/result', (req, res, next) => {
  let pool = req.hosPool;
  let vn = req.body.vn;

  lab.getLabResult(pool, vn)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ ok: false, msg: err });
    })
})

router.post('/lab/date-list', (req, res, next) => {
  let pool = req.iLabPool;
  let hospcode = req.body.hospcode;

  lab.getDateOrderList(pool, hospcode)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ ok: false, msg: err });
    })
})

router.post('/lab/get-send-list', (req, res, next) => {
  let pool = req.iLabPool;
  let hospcode = req.body.hospcode;
  let date = req.body.date;

  lab.getOrderListByDate(pool, hospcode, date)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ ok: false, msg: err });
    })
})

router.get('/lab/result-print', (req, res, next) => {
  let pool = req.hosPool;
  let iLabPool = req.iLabPool;
  let vn = req.query.vn;
  let orderId = req.query.orderId;

  let json = {};

  fse.ensureDirSync('./templates/html');
  fse.ensureDirSync('./templates/pdf');

  var destPath = './templates/html/' + moment().format('x');
  fse.ensureDirSync(destPath);

  lab.getLabOrderDetail(iLabPool, orderId)
    .then(detail => {
      json.detail = detail;
      return lab.getLabResult(pool, vn);
    })
    .then(rows => {
      json.items = rows;
      gulp.task('html', (cb) => {
        return gulp.src('./templates/lab-result.jade')
          .pipe(jsonData(function () {
            return json;
          }))
          .pipe(jade())
          .pipe(gulp.dest(destPath));
      });

      gulp.task('pdf', ['html'], () => {
        let html = fs.readFileSync(destPath + '/lab-result.html', 'utf8')
        let options = {
          // format: 'A4',
          height: "8in",
          width: "6in",
          orientation: "portrait",
          footer: {
            height: "15mm",
            contents: '<span style="color: #444;"><small>Printed: ' + new Date() + '</small></span>'
          }
        }

        let pdfName = `./templates/pdf/lab-result-${moment().format('x')}.pdf`;

        pdf.create(html, options).toFile(pdfName, (err, resp) => {
          if (err) {
            res.send({ ok: false, msg: err });
          } else {
            console.log(pdfName)
            res.download(pdfName, () => {
              rimraf.sync(destPath);
              fse.removeSync(pdfName);
            });
          }
        })
      });
      
      gulp.start('pdf');

    }, err => {
      console.log(err);
      res.send({ ok: false, msg: err });
    });
  
})

router.get('/lab/print-send-list', (req, res, next) => {
  let pool = req.iLabPool;
  let hospcode = req.query.hospcode;
  let date = req.query.date;
  
  let json = {};

  json.sendDate = `${moment(date, 'YYYY-MM-DD').locale('th').format('DD MMMM')} ${moment(date, 'YYYY-MM-DD').get('year') + 543}`  
  fse.ensureDirSync('./templates/html');
  fse.ensureDirSync('./templates/pdf');

  var destPath = './templates/html/' + moment().format('x');
  fse.ensureDirSync(destPath);

  // get hospital name
  lab.getHospitalName(pool, hospcode)
    .then(hospital => {
      json.hospcode = hospital.hospcode
      json.hospname = hospital.hospname
      return lab.getOrderListByDate(pool, hospcode, date);
  })
    .then(rows => {
      json.patient = rows;
      gulp.task('html', (cb) => {
        return gulp.src('./templates/lab-send.jade')
          .pipe(jsonData(() => {
            return json;
          }))
          .pipe(jade())
          .pipe(gulp.dest(destPath));
      });

      gulp.task('pdf', ['html'], () => {
        let html = fs.readFileSync(destPath + '/lab-send.html', 'utf8')
        let options = {
          format: 'A4',
          // height: "8in",
          // width: "6in",
          orientation: "portrait",
          footer: {
            height: "15mm",
            contents: '<span style="color: #444;"><small>Printed: ' + new Date() + '</small></span>'
          }
        }

        let pdfName = `./templates/pdf/lab-send-${moment().format('x')}.pdf`;

        pdf.create(html, options).toFile(pdfName, (err, resp) => {
          if (err) {
            res.send({ ok: false, msg: err });
          } else {
            // console.log(pdfName)
            res.download(pdfName, () => {
              rimraf.sync(destPath);
              fse.removeSync(pdfName);
            });
          }
        })
      });
      
      gulp.start('pdf');

    }, err => {
      console.log(err);
      res.send({ ok: false, msg: err });
    });
  
})

/////// for hospital
router.post('/lab/hos/order-list', (req, res, next) => {
  let pool = req.iLabPool;

  lab.hospitalGetOrderListAll(pool)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/lab/hos/order-list-confirm', (req, res, next) => {
  let pool = req.iLabPool;
  let hospcode = req.body.hospcode;
  let confirm = req.body.confirm;

  lab.hospitalGetOrderListConfirm(pool, hospcode, confirm)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ok: false, msg: err})
    });
})

router.post('/lab/hospital-list', (req, res, next) => {
  let pool = req.iLabPool;
  lab.getHospitalList(pool)
    .then(rows => {
      res.send({ ok: true, rows: rows });
    }, err => {
      res.send({ ok: false, msg: err });
    });
})

router.post('/lab/hos/order-lab-item', (req, res, next) => {
  let pool = req.iLabPool;
  let orderId = req.body.orderId;

  lab.hospitalGetOrderLabItem(pool, orderId)
    .then(rows => {
      let items = [];
      rows.forEach(v => {
        items.push(v.lab_items_code)
      })

      res.send({ok: true, rows: items})
    }, err => {
      res.send({ ok: false, msg: err });
    });
})

router.put('/lab/save', (req, res, next) => {
  let pool = req.iLabPool;
  let orderId = req.body.orderId;
  let vn = req.body.vn;

  lab.saveOrderResult(pool, orderId, vn)
    .then(() => {
      res.send({ok: true})
    }, err => {
      res.send({ ok: false, msg: err })
    });
})

module.exports = router;
