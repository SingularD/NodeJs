
/*
 * GET home page.
 */
var passport = require('passport');
var crypto = require('crypto');
fs = require('fs');
User = require('../models/user');
Post = require('../models/post');
Comment = require('../models/comment');

module.exports = function (app) {
    app.get('/',function (req,res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Post.getTen(null,page,function (err,posts,total) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1)*10+posts.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                posts:posts
            });
        });
    });
    app.get('/reg',checkNotLogin);
    app.get('/reg',function (req,res) {
        res.render('reg', {
            title: "注册",
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });
    app.post('/reg',checkNotLogin);
    app.post('/reg',function (req,res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        if (!(password === password_re)){
            req.flash('error', '密码不一致！');
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update((req.body.password).toString()).digest('hex');
        var newUser = new User({
            name: req.body.name,
            password: password,
            email: req.body.email
        });
        User.get(newUser,function (err,user) {
            if (err){
                req.flash('error','用户已存在！');
                return res.redirect('/reg');
            }
            newUser.save(function (err,user) {
                if (err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user = user;
                req.flash('success','注册成功！');
                res.redirect('/');
            });
        });
    });
    app.get('/login',checkNotLogin);
    app.get('/login',function (req,res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.get('/login/github',passport.authenticate("github",{session: false}));
    app.get('/login/github/callback',passport.authenticate("github",{
        session: false,
        failureRedirect: '/login',
        successFlash: '登录成功!'
    }),function (req,res) {
        req.session.user = {name: req.user.username, head: "https://gravatar.com/avatar/"+req.user._json.gravatar_id+"?=48"};
        res.redirect("/");
    });
    app.post('/login',checkNotLogin);
    app.post('/login',function (req,res) {
        var md5 = crypto.createHash('md5'),
            password = md5.update((req.body.password).toString()).digest('hex');
        User.get(req.body.name,function (err,user) {
            if (!user) {
                req.flash('error','用户不存在!');
                return res.redirect('/login');
            }
            if (!(user.password === password)) {
                req.flash('error','密码错误！');
                return res.redirect('/login')
            }
            req.session.user = user;
            req.flash('success','登录成功！');
            res.redirect('/');
        });
    });

    app.get('/post',checkLogin);
    app.get('/post',function (req,res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post',checkLogin);
    app.post('/post',function (req,res) {
        var currentUser = req.session.user,
            tags = [req.body.tag1,req.body.tag2,req.body.tag3],
            post = new Post(currentUser.name,req.body.title,tags,req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error',err);
                return res.redirect('/')
            }
            req.flash('success','发布成功！');
            res.redirect('/');
        });
    });

    app.get('/logout',checkLogin);
    app.get('/logout',function (req,res) {
        req.session.user = null;
        req.flash('success','登出成功！');
        res.redirect('/');
    });

    app.get('/upload',checkLogin);
    app.get('/upload',function (req,res) {
       res.render('upload',{
           title: '文件上传',
           user: req.session.user,
           success: req.flash('success').toString(),
           error: req.flash('error').toString()
       });
    });

    app.post('/upload',checkLogin);
    app.post('/upload',function (req,res) {
       for (var i in req.files) {
           if (req.files[i].size === 0) {
               fs.unlinkSync(req.files[i].path);
               console.log('Successfully removed an empty file!');
           } else {
               var tmp_path = req.files[i].path;
               var target_path = 'public/images/' + req.files[i].name;
               fs.rename(tmp_path,target_path,function (err) {
                   if (err)throw err;
               });
               console.log('Successfully rename a file!');
           }
       }
       req.flash('success','文件上传成功！');
       res.redirect('/upload');
    });

    app.get('/archive',function (req,res) {
        Post.getArchive(function (err,posts) {
            if (err) {
                req.flash('error',err);
                return res.redirect('/')
            }
            res.render('archive',{
                title: '存档',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });


    app.get('/tags',function (req,res) {
        PostTags(function (err,posts) {
            if (err) {
                req.flash('err',err);
                return res.redirect('/')
            }
            res.render('tags',{
                title: '标签',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.get('/tags/:tag',function (req,res) {
        Post.getTag(req.params.tag,function (err,posts) {
            if (err) {
                req.flash('error',err);
                return res.redirect('/')
            }
            res.render('tag', {
                title: 'TAG:' + req.params.tag,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });


    app.get('/links',function (req,res) {
        res.render('links',{
            title: '友情链接',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.get('/search',function (req,res) {
        Post.search(req.query.keyword,function (err,posts) {
            if (err) {
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('search',{
                title: "SEARCH" + req.query.keyword,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.get('/u/:name', function (req, res) {
        //检查用户是否存在
        var page = req.query.p ? parseInt(req.query.p) : 1;
        User.get(req.params.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/');//用户不存在则跳转到主页
            }
            //查询并返回该用户的所有文章
            Post.getTen(user.name, page, function (err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1)*10+posts.length) == total,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });

    app.get('/u/:name/:day/:title', function (req, res) {
        Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('article', {
                title: req.params.title,
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.get('/edit/:name/:day/:title',checkLogin);
    app.get('/edit/:name/:day/:title',function (req,res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name,req.params.day,req.params.title,function (err,post) {
            if (err) {
                req.flash('error',err);
                return redirect('back');
            }
            res.render('edit',{
                title: '编辑',
                post: post,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        });
    });

    app.post('/edit/:name/:day/:title',checkLogin);
    app.post('/edit/:name/:day/:title',function (req,res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function (err) {
            var url = '/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title;
            if (err) {
                req.flash('error',err);
                return res.redirect(url);
            }
            req.flash('success','修改成功！');
            res.redirect(url);
        });
        console.log('post successfully')
    });

    app.get('/remove/:name/:day/:title',checkLogin);
    app.get('/remove/:name/:day/:title',function (req,res) {
        var currentUser = req.session.user;
        Post.remove(currentUser.name,req.params.day,req.params.title,function (err) {
            if (err) {
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','删除成功！');
            res.redirect('/');
        });
    });

    app.post('/u/:name/:day/:title',function (req,res) {
        var date = new Date(),
            time = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+'-'
            +date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
       var comment = {
           name: req.body.name,
           email: req.body.email,
           website: req.body.website,
           time: time,
           content: req.body.content
       };

       var newComment = new Comment(req.params.name,req.params.day,req.params.title,comment);
       console.log(newComment);
       console.log("index.js");
       ///////
       newComment.save(function (err) {
           if (err) {
               req.flash('error',err);
               return res.redirect('back');
           }
           req.flash('success','留言成功！');
           res.redirect('back');
       });
    });
    app.use(function (req,res) {
        res.render("404")
    });
    function checkLogin(req,res,next) {
        if (!req.session.user){
            req.flash('error','未登录');
            return redirect('/login');
        }
        next();
    }

    function checkNotLogin(req,res,next) {
        if (req.session.user){
            req.flash('error','已登录！');
            return redirect('back');
        }
        next();
    }
};

