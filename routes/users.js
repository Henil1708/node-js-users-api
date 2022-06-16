const { getSingleUserDetails, getAllUsersDetails,updateCurrentUser } = require('../controllers/users');
const router = require('express').Router();
const passport = require('passport');
require("../middleware/Passport");

// update existing user
router.post("/update",passport.authenticate('jwt', { session: false }), updateCurrentUser);

// get user using their id 
router.get("/single-user/:id",passport.authenticate('jwt', { session: false }), getSingleUserDetails);

// get all users list
router.get("/", passport.authenticate('jwt', { session: false }), getAllUsersDetails);


module.exports = router;