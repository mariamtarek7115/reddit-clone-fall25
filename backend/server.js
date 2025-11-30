const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const User=require("./models/User");


const app=express();

const userRoute = require("./routes/userRoute");
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/redditClone")
app.use("/", userRoute);

app.listen(5000, () => console.log("Server running on port 5000"));