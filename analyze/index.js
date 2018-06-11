var request = require('request');
var path = require('path');
var config = require('./config');
var analyze = require('./analyze');

function start() {
    request(config.url,function (err,res,body) {
        console.log('start!');
        if (!err && res) {
            console.log('start!');
            analyze.findImg(body,downLoad);
        }
    })
};

function downLoad(imgUrl,i) {
    var ext = imgUrl.split('.').pop();
    request(imgUrl).pipe(fs.createWriteStream(path.join(config.imgDir,i+'.'+ext),{
        'encoding':'utf-8'
    }));
    console.log(i);
};

start();