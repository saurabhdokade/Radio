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
} = require("../controller/adminController");

const { isAuthenticatedAdmin } = require("../middlewares/auth");
const multer = require('multer');
const path = require('path');
const upload = require("../utils/multer");
const { getAllUsers } = require("../controller/userController");
// Import validation functions
const router = express.Router();
router.route("/admin/signup").post(registerUser);
router.route("/admin/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/admin/password/forgot").post(forgotPassword);
router.route("/admin/password/reset/").put(verifyOtpAndResetPassword);
router.route('/admin/:id').get(getUserDetails);
router.route("/getallusers").get(isAuthenticatedAdmin, getAllUsers)
router.route("/users/:id").put(isAuthenticatedAdmin, upload.single("userProfile"),updateUserDetails) 
router.route("/users/:id").delete(isAuthenticatedAdmin, deleteUser); 





module.exports = router;