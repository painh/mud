var express = require('express');
var router = express.Router();
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;

// serialize
// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    console.log('serialize');
    done(null, user);
});

// deserialize
// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function (user, done) {
    //findById(id, function (err, user) {
    console.log('deserialize');
    done(null, user);
    //});
});

passport.use(new FacebookStrategy({
        clientID: '409638666082567',
        clientSecret: 'f63901d4b2e4e6d45bf3746597e69c77',
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        done(null, profile);
    }
));

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/login_success',
        failureRedirect: '/login_fail'
    }));


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}


router.get('/login_success', ensureAuthenticated, function (req, res) {
    res.redirect('/mud/');
});
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', {title: 'login', data: {hostname: req.headers.host}});
});

/* GET home page. */
router.get('/mud/', function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
        return;
    }

    res.render('mud', {title: 'mud', hostname: req.headers.host } );
});

module.exports = router;
