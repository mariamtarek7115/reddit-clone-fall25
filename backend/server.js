const express = require("express");
const mongoose = require("mongoose");
const User=require("./models/User");


const app=express();

mongoose.connect("mongodb://localhost:27017/redditClone")

app.listen(3000, () => console.log("Server running on port 3000"));