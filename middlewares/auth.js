const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel")

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHander('Please login to access this resource', 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decodedData.id);


  req.user = user;

  next();
});






exports.isAuthenticatedAdmin = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHander('Please login to access this resource', 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const user = await Admin.findById(decodedData.id);

  if (!user || user.role !== 'admin') {
    return next(new ErrorHander('Unauthorized Access. Only Admin can access this', 403));
  }

  req.user = user;

  next();
});



exports.authorizeRoles = (...roles) =>{

    return(req,res,next)=>{
       if(!roles.includes(req.user.role)){
       return next(new ErrorHander(
            `Role: ${req.user.role} is not allowed to access this resource`,
            403
          )
         )
       }
       
      next();
    }
}
