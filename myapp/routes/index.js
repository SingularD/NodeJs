var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/input',function (req, res) {
  res.render('input')
});
router.post('/input',function (req, res) {
  var name = req.body.username;
  var psw = req.body.password;
  console.log('username is %s',name);
  console.log('password is %s',psw);
});


router.get('/hello',function (req, res) {
  res.render('sayHello')
});

module.exports = router;
