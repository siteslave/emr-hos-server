'use strict';

let express = require('express');
let passwordHash = require('password-hash');
let login = require('../models/login');
let jwt = require('../models/jwt');

let router = express.Router();

router.post('/', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    login.auth(req.authPool, username)
      .then(user => {
        if (user) {
          let hashedPassword = user.password;
          if (passwordHash.verify(password, hashedPassword)) {
            let playload = {id: user.id}
            let token = jwt.sign(playload);
            res.send({ ok: true, token: token });
          } else {
            res.send({ok: false, msg: 'Invalid password.'})
          }
        } else {
          res.send({ ok: false, msg: 'User not found.' }); 
      }
    })
  } else {
    res.send({ ok: false, msg: 'Please enter username/password.' });
  }
});

router.get('/genpass/:pass', (req, res, next) => {
  let hashedPassword = passwordHash.generate(req.params.pass);
  res.send(hashedPassword);
})

module.exports = router;
