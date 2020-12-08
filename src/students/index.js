const express = require("express")
const fs = require("fs") //core nodejs module (file system)
const path = require("path") //core module, i will be sure to be safely creating paths
const uniqid = require("uniqid") //third party module

const router = express.Router() //lets me create a collection of endpoints(router.get(), router.post() ecc)

//route 1 all users route
router.get("/", (req, res) => {
  const studentsPathFile = path.join(__dirname, "students.json")

  const fileAsBuffer = fs.readFileSync(studentsPathFile) //returns a buffer, machine readable code, so must be converted
  const file = fileAsBuffer.toString() //we want to send a JSON, not a string
  const fileJSON = JSON.parse(file)
  console.log(fileJSON)

  res.send(fileJSON)
})

//Post

//route 3
router.post("/", (req, res) => {
  const studentsPathFile = path.join(__dirname, "students.json")
  const fileAsBuffer = fs.readFileSync(studentsPathFile)
  const file = fileAsBuffer.toString()
  const studentsArray = JSON.parse(file)
  //push new user to array
  const newStudent = req.body
  console.log(newStudent)
  newStudent.ID = uniqid()

  studentsArray.push(newStudent)
  //replace old content with new
  fs.writeFileSync(studentsPathFile, JSON.stringify(studentsArray))
  res.status(201).send({id: newStudent.ID})
})

module.exports = router
