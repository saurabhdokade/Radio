const express = require("express");
const { createContact, getAllContacts, getContactById, deleteContact } = require("../controller/contactController");
const { isAuthenticatedUser, authorizeRoles, isAuthenticatedAdmin } = require("../middlewares/auth");

const router = express.Router();

router.route("/contact").post(createContact); // Public - create contact
router.route("/admin/getallcontacts").get(isAuthenticatedAdmin, getAllContacts);
router.route("/admin/contact/:id")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getContactById)
  .delete(isAuthenticatedAdmin, authorizeRoles("admin"), deleteContact);

module.exports = router;
