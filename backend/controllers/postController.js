const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");


const toInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
};


exports.createPost = async (req, res) => {
  try {
    // For multipart/form-data, multer puts file on req.file and text fields on req.body
    const { title, body, authorId, communityId, url } = req.body;
    const file = req.file;

    // ✅ Required fields
    if (!title || !authorId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate authorId
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: "Invalid authorId" });
    }

    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // 🔹 COMMUNITY IS OPTIONAL FOR NOW
    let community = null;

    if (communityId) {
      if (!mongoose.Types.ObjectId.isValid(communityId)) {
        return res.status(400).json({ message: "Invalid communityId" });
      }

      // ⚠️ community model may not exist yet
      // so we only assign ID without lookup
      community = communityId;
    }

    const hasBody = body && body.trim().length > 0;
    const hasFile = Boolean(file);
    const hasUrl = url && url.trim().length > 0;

    let computedType = "text";
    const filledCount = [hasBody, hasFile, hasUrl].filter(Boolean).length;
    if (filledCount > 1) computedType = "mixed";
    else if (hasFile) computedType = "image";
    else if (hasUrl) computedType = "link";

    const mediaUrl = hasFile ? `/uploads/${file.filename}` : null;

    const newPost = new Post({
      title,
      body: hasBody ? body : null,
      type: computedType,
      mediaUrl: mediaUrl,
      url: hasUrl ? url : null,
      author: authorId,
      community: community || undefined,
    });

    const savedPost = await newPost.save();

    // Return populated post so frontend can navigate to community or show details
    const populated = await Post.findById(savedPost._id)
      .populate("author", "username")
      .populate("community", "name");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error creating post" });
  }
};


exports.getFeedPosts = async (req, res) => {
  try {
    const sort = (req.query.sort || "new").toLowerCase();
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, toInt(req.query.limit, 10)));
    const skip = (page - 1) * limit;

    const { communityName, username } = req.query;

    const filter = { isDeleted: false };

    if (communityName) {
      const name = String(communityName || "").trim().toLowerCase();
      const community = await Community.findOne({ name });
      if (!community) return res.status(404).json({ message: "Community not found" });
      filter.community = community._id;
    }

    if (username) {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: "User not found" });
      filter.author = user._id;
    }

    let sortObj = { createdAt: -1 }; // default "new"
    if (sort === "top") sortObj = { upvotes: -1, createdAt: -1 };
    if (sort === "hot") sortObj = { commentsCount: -1, createdAt: -1 }; // simple "hot"

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "username")
        .populate("community", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    return res.json({
      page,
      limit,
      total,
      posts,
    });
  } catch (err) {
    console.error("getFeedPosts error:", err);
    return res.status(500).json({ message: "Server error fetching posts" });
  }
};


exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false })
      .populate("author", "username")
      .populate("community", "name");

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json({ post });
  } catch (err) {
    console.error("getPostById error:", err);
    return res.status(500).json({ message: "Server error fetching post" });
  }
};


exports.getPostsByCommunity = async (req, res) => {
  try {
    const { communityName } = req.params;

    const community = await Community.findOne({ name: communityName });
    if (!community) return res.status(404).json({ message: "Community not found" });

    const posts = await Post.find({ community: community._id, isDeleted: false })
      .populate("author", "username")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    return res.json({ posts });
  } catch (err) {
    console.error("getPostsByCommunity error:", err);
    return res.status(500).json({ message: "Server error fetching community posts" });
  }
};

exports.getPostsByUser = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: user._id, isDeleted: false })
      .populate("author", "username")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    return res.json({ posts });
  } catch (err) {
    console.error("getPostsByUser error:", err);
    return res.status(500).json({ message: "Server error fetching user posts" });
  }
};


exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { authorId, title, body, url } = req.body;
    const file = req.file;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }
    if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: "Valid authorId is required" });
    }

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    if (String(post.author) !== String(authorId)) {
      return res.status(403).json({ message: "Not allowed to edit this post" });
    }

    if (typeof title === "string") post.title = title;
    if (typeof body === "string") post.body = body;
    if (typeof url === "string") post.url = url;
    if (file) post.mediaUrl = `/uploads/${file.filename}`;

    // Recompute type if needed
    const hasBody = post.body && post.body.trim().length > 0;
    const hasFile = Boolean(post.mediaUrl);
    const hasUrl = post.url && post.url.trim().length > 0;
    const filledCount = [hasBody, hasFile, hasUrl].filter(Boolean).length;
    if (filledCount > 1) post.type = "mixed";
    else if (hasFile) post.type = "image";
    else if (hasUrl) post.type = "link";
    else post.type = "text";

    await post.save();

    const populated = await Post.findById(post._id)
      .populate("author", "username")
      .populate("community", "name");

    return res.json({ message: "Post updated", post: populated });
  } catch (err) {
    console.error("updatePost error:", err);
    return res.status(500).json({ message: "Server error updating post" });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { authorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }
    if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: "Valid authorId is required" });
    }

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    if (String(post.author) !== String(authorId)) {
      return res.status(403).json({ message: "Not allowed to delete this post" });
    }

    post.isDeleted = true;
    await post.save();

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("deletePost error:", err);
    return res.status(500).json({ message: "Server error deleting post" });
  }
};
exports.getMyFeedPosts = async (req, res) => {
  try {
    const sort = (req.query.sort || "new").toLowerCase();
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, toInt(req.query.limit, 10)));
    const skip = (page - 1) * limit;

    // ✅ You can pass userId from frontend (like you do everywhere)
    const userId = req.query.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }

    let sortObj = { createdAt: -1 };
    if (sort === "top") sortObj = { upvotes: -1, createdAt: -1 };
    if (sort === "hot") sortObj = { commentsCount: -1, createdAt: -1 };

    // ✅ Find joined communities from CommunityMember collection
    const memberships = await CommunityMember.find({ user: userId })
      .select("community")
      .lean();

    const joinedCommunityIds = memberships.map((m) => m.community);

    // 1) Posts from joined communities
    const joinedCommunityPosts = await Post.find({
      isDeleted: false,
      community: { $in: joinedCommunityIds },
    })
      .populate("author", "username")
      .populate("community", "name")
      .sort(sortObj)
      .lean();

    // 2) Other posts (including posts with no community)
    const otherPosts = await Post.find({
      isDeleted: false,
      $or: [
        { community: { $nin: joinedCommunityIds } },
        { community: { $exists: false } },
        { community: null },
      ],
    })
      .populate("author", "username")
      .populate("community", "name")
      .sort(sortObj)
      .lean();

    const combined = [...joinedCommunityPosts, ...otherPosts];

    // paginate after combining
    const total = combined.length;
    const posts = combined.slice(skip, skip + limit);

    return res.json({ page, limit, total, posts });
  } catch (err) {
    console.error("getMyFeedPosts error:", err);
    return res.status(500).json({ message: "Server error fetching my feed" });
  }
};