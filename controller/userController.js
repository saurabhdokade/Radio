const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

const crypto = require("crypto");
const jwt = require('jsonwebtoken');
require("dotenv").config();


// exports.registerUser = catchAsyncErrors(async (req, res, next) => {
//   const {  name, email,password,phone } = req.body;
//   console.log("Registering user:", req.body);

//   const user = await User.findOne({ email: phone });


//   user.name = name;
//   user.phone = email;
//   user.password = password;
//   await user.save();

//   return res.status(201).json({
//     success: true,
//     message: "Account created successfully.",
//   });
// });
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  console.log("Registering user:", req.body);

  // Check if the user already exists
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email.",
    });
  }

  // Create new user
  const newUser = new User({
    name,
    email,
    phone,
    password,
  });

  await newUser.save();

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
  });
});




// Logout Agent
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.header("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHander("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");


  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});



// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorHander("User not found", 404));
    }
  
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // valid for 10 mins
    await user.save({ validateBeforeSave: false });
  
    const message = `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP",
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `OTP sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHander("Failed to send OTP email", 500));
    }
  });
  
// Reset Password  
exports.verifyOtpAndResetPassword = catchAsyncErrors(async (req, res, next) => {
    const { otp, password, confirmPassword } = req.body;
  
    if (!otp || !password || !confirmPassword) {
      return next(new ErrorHander("All fields are required", 400));
    }
  
    // Find user by OTP and check if OTP is not expired
    const user = await User.findOne({
      otp,
      otpExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(new ErrorHander("Invalid or expired OTP", 400));
    }
  
    if (password !== confirmPassword) {
      return next(new ErrorHander("Passwords do not match", 400));
    }
  
    user.password = password;
    user.otp = undefined;
    user.otpExpire = undefined;
  
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  });

// Get Single User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      registrationDate: user.registrationDate,
      activityLogs: user.activityLogs,
    },
  });
});
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  // Fetch all users from DB
  const users = await User.find();

  if (!users || users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No users found",
    });
  }

  // Map user data to only include required fields
  const userList = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    registrationDate: user.registrationDate,
    activityLogs: user.activityLogs,
  }));

  res.status(200).json({
    success: true,
    users: userList,
  });
});


// -------------------------- Update User Details (Admin Only) --------------------------
exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, locality } = req.body;

  // Find user by ID
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  // Update fields if provided in the request body
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (locality) user.locality = locality;


  if (req.file) {
    user.userProfile = req.file.path;
  }
  // Save the updated user
  await user.save();

  res.status(200).json({
    success: true,
    message: "User details updated successfully!",
    user,
  });
});

// -------------------------- Delete User (Admin Only) --------------------------
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully!",
  });
});


