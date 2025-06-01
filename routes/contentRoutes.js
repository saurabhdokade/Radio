const express = require("express");
const router = express.Router();
const {createContent,getAllContents,viewContent,updateContent,deleteContent} = require("../controller/contentController");
const upload = require("../utils/multer");
const { isAuthenticatedAdmin, isAuthenticatedUser } = require("../middlewares/auth");
const contentUpload = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "bannerUrl", maxCount: 1 }, 
]);

router.post("/createcontent",isAuthenticatedAdmin,contentUpload, createContent);
router.get("/getallcontents", getAllContents);
router.get("/view/:id",isAuthenticatedUser,isAuthenticatedAdmin, viewContent);
router.put("/update/:id",isAuthenticatedAdmin,contentUpload, updateContent);
router.delete("/delete/:id", deleteContent);

module.exports = router;

