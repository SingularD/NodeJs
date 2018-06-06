var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/lsw';

MongoClient.connect(url,function (err,db) {
    if (err) throw err;
    var dbo = db.db('lsw');
    var text = {name: 'lisongwei',age: '20'};
    dbo.collection('site').insertOne(text,function (err,res) {
        if (err) throw err;
        console.log("成功");
        db.close();
    })
})