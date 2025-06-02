const Contact = require("../models/contactModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create a new contact/feedback
exports.createContact = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, message } = req.body;

  // Save the contact entry
  const contact = await Contact.create({
    name,
    email,
    phone,
    message,
    user: req.user ? req.user._id : null // If user is authenticated
  });

  res.status(201).json({
    success: true,
    message: "Thank you for your feedback!",
    data: contact
  });
});

// Get all contacts (admin view)
exports.getAllContacts = catchAsyncErrors(async (req, res, next) => {
  const contacts = await Contact.find().populate("user", "name email"); // Populate user info

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts
  });
});

// Get single contact by ID
exports.getContactById = catchAsyncErrors(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id).populate("user", "name email");

  if (!contact) {
    return next(new ErrorHandler("Contact not found", 404));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// Delete a contact
exports.deleteContact = catchAsyncErrors(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return next(new ErrorHandler("Contact not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Contact entry deleted successfully"
  });
});

