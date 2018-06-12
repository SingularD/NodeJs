var cheerio = require('cheerio');

function findImg(url_path,dom,callback) {
    var $ = cheerio.load(dom);
    $('img').each(function (i,elem) {
        var imgSrc = $(this).attr('src');
        callback(url_path,imgSrc,i)
    })
};

module.exports.findImg = findImg;