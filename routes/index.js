const router = require('express').Router();
const auth = require("./auth");
const users = require("./users");

// authentication routes
router.use('/auth', auth);

// user related routes
router.use('/users', users);
 
module.exports = router;