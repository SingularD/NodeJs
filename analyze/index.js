var request = require('request');
var path = require('path');
var config = require('./config');
var analyze = require('./analyze');
var fs = require('fs');

function start() {
    request(config.url,function (err,res,body) {
        console.log('start!');
        if (!err && res) {
            console.log('start!');
            analyze.findImg(config.url,body,downLoad);
        }
    })
};

function downLoad(url_path,imgUrl,i) {
    var reg_params=/http/;
    if(!reg_params.test(imgUrl))
        imgUrl=url_path+imgUrl;
    console.log(imgUrl);
    var ext = imgUrl.split('.').pop();
    request(imgUrl).pipe(fs.createWriteStream(path.join(config.imgDir,i+'.'+ext),{
        'encoding':'utf-8'
    }));
    // console.log(i);
};

start();