const express = require("express");
const mongoose = require("mongoose");
const usersRoute = require("./routes/userRoute");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/redditClone")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Use the users router
app.use("/user", usersRoute);

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));