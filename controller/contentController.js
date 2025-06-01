const { Content, Categories } = require("../models/contentModel");

exports.createContent = async (req, res) => {
  try {
    const { title, category, content,language } = req.body;
    let fileUrl = "";
    let bannerUrl = "";

    if (!Categories.includes(category)) {
      return res.status(400).json({ message: "Invalid category!" });
    }

    if (
      req.files &&
      req.files.file &&
      req.files.file[0] &&
      req.files.file[0].path
    ) {
      fileUrl = req.files.file[0].path;
    }

    if (
      req.files &&
      req.files.bannerUrl &&
      req.files.bannerUrl[0] &&
      req.files.bannerUrl[0].path
    ) {
      bannerUrl = req.files.bannerUrl[0].path;
    }

    const newContent = new Content({
      user: req.user._id,
      title,
      category,
      fileUrl,
      content,
      language,
      bannerUrl,
    });

    await newContent.save();

    res.status(201).json(newContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAllContents = async (req, res) => {
  try {
    // Get search, category, language from query params
    const search = req.query.search || "";
    const category = req.query.category || "";
    const language = req.query.language || ""; // expecting a single language string here

    // Build base query
    let query = {};

    // If search is present, match title or category (case-insensitive)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    // If category filter is explicitly given
    if (category) {
      if (query.$or) {
        query = {
          $and: [
            query,
            { category: category } // exact category match
          ]
        };
      } else {
        query.category = category;
      }
    }

    // If language filter is explicitly given
    if (language) {
      // language is an array field, so use $in to check if the array contains the language
      if (query.$and) {
        // If already $and from above category and search, add language filter to $and array
        query.$and.push({ language: language });
      } else if (query.$or) {
        // If $or exists without $and
        query = {
          $and: [
            query,
            { language: language }
          ]
        };
      } else {
        query.language = language;
      }
    }

    // Fetch contents
    const contents = await Content.find(query).lean();

    // Add viewCount property
    const contentsWithViewCount = contents.map(content => ({
      ...content,
      viewCount: content.views ? content.views.length : 0
    }));

    // Sort by viewCount descending
    contentsWithViewCount.sort((a, b) => b.viewCount - a.viewCount);

    res.json(contentsWithViewCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// View a content (add user ID to views)
// exports.viewContent = async (req, res) => {
//   try {
//     // 1. Check user is logged in
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ message: "Unauthorized: Please log in." });
//     }

//     // 2. Find the requested content with creator info
//     const content = await Content.findById(req.params.id).populate("user", "name email");
//     if (!content) {
//       return res.status(404).json({ message: "Content not found" });
//     }

//     const userId = req.user._id.toString();

//     // 3. Add user to views if not already present
//     if (!content.views.map(v => v.toString()).includes(userId)) {
//       content.views.push(userId);
//       await content.save();
//     }

//     // 4. Find all content the user has viewed (liked) to get categories they interacted with
//     const userViewedContents = await Content.find({ views: userId }).select("category").lean();

//     // Extract unique categories from user viewed contents
//     const userLikedCategories = [...new Set(userViewedContents.map(c => c.category))];

//     // 5. Extract keywords from current content text and title
//     const combinedText = ((content.content || "") + " " + (content.title || "")).toLowerCase();
//     const keywords = combinedText
//       .split(/\W+/)
//       .filter(word => word.length > 2); // ignore short words

//     // Create regex array for keywords (case-insensitive)
//     const keywordRegexes = keywords.map(kw => new RegExp(kw, "i"));

//     // 6. Find related content matching keywords in either content or title (top priority)
//     const keywordMatchedContent = await Content.find({
//       _id: { $ne: content._id },
//       $or: [
//         { content: { $in: keywordRegexes } },
//         { title: { $in: keywordRegexes } },
//       ],
//     }).limit(10).lean();

//     // Get IDs of already found content to exclude in next query
//     const keywordMatchedIds = keywordMatchedContent.map(c => c._id.toString());

//     // 7. Then get other related content excluding already found ones
//     const otherRelatedContent = await Content.find({
//       _id: { $nin: [content._id.toString(), ...keywordMatchedIds] },
//       $or: [
//         { user: content.user._id },
//         { category: { $in: userLikedCategories } },
//         { category: content.category }
//       ]
//     }).limit(10).lean();

//     // 8. Combine results: keyword matches first, then others
//     const relatedContent = [...keywordMatchedContent, ...otherRelatedContent];

//     // 9. Send response
//     res.json({
//       content,
//       creatorName: content.user.name,
//       totalViews: content.views.length,
//       userLikedCategories,
//       relatedContent,
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



exports.viewContent = async (req, res) => {
  try {
    // 1. Check if user is logged in
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: Please log in." });
    }

    // 2. Find requested content by ID and populate user info
    const content = await Content.findById(req.params.id).populate("user", "name email");
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const userId = req.user._id.toString();

    // 3. Add current user to content views if not already included
    if (!content.views.some(v => v.toString() === userId)) {
      content.views.push(userId);
      await content.save();
    }

    // 4. Get all categories user has interacted with (viewed contents)
    const userViewedContents = await Content.find({ views: userId }).select("category").lean();
    const userLikedCategories = [...new Set(userViewedContents.map(c => c.category))];

    // 5. Extract keywords from content title and content text
    const combinedText = `${content.title || ""} ${content.content || ""}`.toLowerCase();

    // Extract unique keywords, filtering out very short words
    const keywords = [...new Set(
      combinedText.split(/\W+/).filter(word => word.length > 2)
    )];

    // 6. Build $or array for keyword matching regex on title or content fields
    // This finds content matching ANY of the keywords in either field
    let keywordMatchedContent = [];
    if (keywords.length > 0) {
      const keywordRegexOr = keywords.flatMap(kw => ([
        { content: { $regex: kw, $options: "i" } },
        { title: { $regex: kw, $options: "i" } }
      ]));

      keywordMatchedContent = await Content.find({
        _id: { $ne: content._id },  // exclude current content
        $or: keywordRegexOr
      }).limit(10).lean();
    }

    const keywordMatchedIds = keywordMatchedContent.map(c => c._id.toString());

    // 7. Find other related content excluding already found and current content
    // Criteria: same creator OR category user liked OR same category
    const otherRelatedContent = await Content.find({
      _id: { $nin: [content._id.toString(), ...keywordMatchedIds] },
      $or: [
        { user: content.user._id },
        { category: { $in: userLikedCategories } },
        { category: content.category }
      ]
    }).limit(10).lean();

    // 8. Combine keyword matched content first, then other related content
    const relatedContent = [...keywordMatchedContent, ...otherRelatedContent];

    // 9. Send JSON response
    return res.json({
      content,
      creatorName: content.user.name,
      totalViews: content.views.length,
      userLikedCategories,
      relatedContent,  // keyword matched content will be at the top here
    });

  } catch (error) {
    console.error("Error in viewContent:", error);
    return res.status(500).json({ message: error.message });
  }
};


// Update content
exports.updateContent = async (req, res) => {
  try {
    const { title, category,language, content: textContent } = req.body;

    if (category && !Categories.includes(category)) {
      return res.status(400).json({ message: "Invalid category!" });
    }

    const existingContent = await Content.findById(req.params.id);
    if (!existingContent) {
      return res.status(404).json({ message: "Content not found" });
    }

    let fileUrl = existingContent.fileUrl || "";
    let bannerUrl = existingContent.bannerUrl || "";

    if (req.files && req.files.file && req.files.file[0] && req.files.file[0].path) {
      fileUrl = req.files.file[0].path;
    }

    if (req.files && req.files.bannerUrl && req.files.bannerUrl[0] && req.files.bannerUrl[0].path) {
      bannerUrl = req.files.bannerUrl[0].path;
    }

    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      {
        title,
        language,
        category,
        fileUrl,
        bannerUrl,
        content: textContent,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedContent);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};
// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const deletedContent = await Content.findByIdAndDelete(req.params.id);
    if (!deletedContent) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
