const router = require('express').Router();
const { signUp, signIn, multipleSignUp } = require('../controllers/auth');
const passport = require('passport');
require("../middleware/Passport");


// sign up using profile image 
router.post("/sign-up", signUp);


// sign in route
router.post("/sign-in", signIn);

// multiple users upload using csv or xlxs file 
router.post("/multiple", passport.authenticate('jwt', { session: false }),multipleSignUp );
 
module.exports = router;