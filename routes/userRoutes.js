const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  updateUserDetails,
  deleteUser,
  verifyOtpAndResetPassword,
  logout,
  getUserDetails,
} = require("../controller/userController");

const { isAuthenticatedUser } = require("../middlewares/auth");
const multer = require('multer');
const path = require('path');
const upload = require("../utils/multer");
// Import validation functions
const router = express.Router();
router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/").put(verifyOtpAndResetPassword);
router.route('/users/:id').get(getUserDetails);
router.route("/users/:id").put(isAuthenticatedUser, upload.single("userProfile"),updateUserDetails) 
router.route("/users/:id").delete(isAuthenticatedUser, deleteUser); 





module.exports = router;