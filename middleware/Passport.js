const passport = require('passport');
const db = require('../config/database');

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'This is a random string for privacy';

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    const getUser = "SELECT * FROM users WHERE id = ? ";
    db.query(getUser, [jwt_payload.id], function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
     });


}));