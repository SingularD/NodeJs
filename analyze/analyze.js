var cheerio = require('cheerio');

function findImg(dom,callback) {
    var $ = cheerio.load(dom);
    $('img').each(function (i,elem) {
        var imgSrc = $(this).attr('src');
        callback(imgSrc,i)
    })
};

module.exports.findImg = findImg;