const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const usersRoute = require("./routes/userRoute");
const communityRoute = require("./routes/communityRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const voteRoute = require("./routes/voteRoute");
const profileRoute = require("./routes/profileRoute");
const searchRoute = require("./routes/searchRoute");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// MongoDB
mongoose.connect(
  "mongodb+srv://mariamtarek7144:Test123@cluster0.y8faazn.mongodb.net/redditClone"
);


// Routes
app.use("/user", usersRoute);
app.use("/profile", profileRoute);
app.use("/posts", postRoute);
app.use("/comments", commentRoute);
app.use("/votes", voteRoute);
app.use("/community", communityRoute);
app.use("/search", searchRoute);

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
