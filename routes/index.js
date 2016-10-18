'use strict';

let express = require('express');
let router = express.Router();

let hdc = require('../models/hdc')

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/test', (req, res, next) => {
  hdc.test(req.hdcPool)
    .then(rows => {
      res.send({ ok: true, rows: rows })
    }, err => {
      res.send({ ok: false, msg: err })
    });
});



module.exports = router;
