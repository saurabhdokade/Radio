const mongoose = require("mongoose");

const Categories = ["audio", "video", "images", "story"];
const Languages = [
  "English",
  "Bengali",
  "Bodo",
  "Dogri",
  "Gujarati",
  "Hindi",
  "Kannada",
  "Kashmiri",
  "Konkani",
  "Maithili",
  "Malayalam",
  "Manipuri",
  "Marathi",
  "Nepali",
  "Odia",
  "Punjabi",
  "Sindhi",
  "Tamil",
  "Telugu",
  "Urdu",
  "Other"
] // example

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminAuth",
    required: true,
  },
  title: { type: String, required: true },
  category: { type: String, enum: Categories, required: true },
  fileUrl: { type: String },
  bannerUrl: { type: String }, // banner for audio/video only
  content: { type: String },
  views: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UsersAuth",
    },
  ],
  language: {
    type: [String],
    enum: Languages,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Content = mongoose.model("Content", contentSchema);

module.exports = { Content, Categories };
