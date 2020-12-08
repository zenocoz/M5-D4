const express = require("express")
const fs = require("fs") //core nodejs module (file system)
const path = require("path") //core module, i will be sure to be safely creating paths
const uniqid = require("uniqid") //third party module

const router = express.Router() //lets me create a collection of endpoints(router.get(), router.post() ecc)
module.exports = router

//route 1 all users route
router.get("/", (req, res) => {
  console.log("Hello world")
}) //handler function
