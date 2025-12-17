const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");


const usersRoute = require("./routes/userRoute");
const communityRoute = require("./routes/communityRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const voteRoute = require("./routes/voteRoute");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


mongoose.connect(
  "mongodb+srv://mariamtarek7144:Test123@cluster0.y8faazn.mongodb.net/redditClone",
)
// Connect to MongoDB
// Use the users router
app.use("/user", usersRoute);
app.use("/profile", require("./routes/profileRoute"));
app.use("/posts", require("./routes/postRoute"));



// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
