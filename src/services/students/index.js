//-----------------------------TOOLS AND MIDDLEWARE--------------------------------------
const express = require("express")
const fs = require("fs") //core nodejs module (file system)
const path = require("path") //core module, i will be sure to be safely creating paths
const uniqid = require("uniqid") //third party module
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { pipeline } = require("stream")
const { readDB, writeDB } = require("../../utils/utilities")

//Middleware Instances
const router = express.Router() //lets me create a collection of endpoints(router.get(), router.post() ecc)
const upload = multer({})

//Paths
const studentsPathFile = path.join(__dirname, "students.json")

//route 1 GET
router.get("/", async (req, res, next) => {
  // const fileAsBuffer = fs.readFileSync(studentsPathFile) //returns a buffer, machine readable code, so must be converted
  // const file = fileAsBuffer.toString() //we want to send a JSON, not a string
  // const fileJSON = JSON.parse(file)
  // console.log(fileJSON)

  try {
    const students = await readDB(studentsPathFile)
    res.send(students)
  } catch (error) {
    next(error)
  }
})

//GET single student

router.get("/:id", async (req, res, next) => {
  // const studentsPathFile = path.join(__dirname, "students.json")
  // const fileAsBuffer = fs.readFileSync(studentsPathFile)
  // const file = fileAsBuffer.toString()
  // const studentsArray = JSON.parse(file)
  const studentsArray = await readDB(studentsPathFile)
  const idComingFromRequest = req.params.id
  console.log("----------------------->", idComingFromRequest)

  const student = studentsArray.filter(
    (student) => student.ID === idComingFromRequest
  )
  console.log("USER ", student)

  res.send(student)
})

//POST
router.post("/", async (req, res, next) => {
  // const studentsPathFile = path.join(__dirname, "students.json")
  // const fileAsBuffer = fs.readFileSync(studentsPathFile)
  // const file = fileAsBuffer.toString()
  // const studentsArray = JSON.parse(file)
  const studentsArray = await readDB(studentsPathFile)
  const newStudent = req.body
  console.log(newStudent)
  newStudent.ID = uniqid()

  studentsArray.push(newStudent)
  await writeDB(studentsPathFile, studentsArray)

  // fs.writeFileSync(studentsPathFile, JSON.stringify(studentsArray))
  res.status(201).send({ id: newStudent.ID })
})

//PUT
router.put("/:id", async (req, res, next) => {
  // const studentsFilePath = path.join(__dirname, "students.json")
  // const fileAsABuffer = fs.readFileSync(studentsFilePath)
  // const fileAsAString = fileAsABuffer.toString()
  // const studentsArray = JSON.parse(fileAsAString)
  const studentsArray = await readDB(studentsPathFile)

  const newStudentsArray = await studentsArray.filter(
    (student) => student.ID !== req.params.id
  )

  const modifiedStudent = req.body
  modifiedStudent.ID = req.params.id

  newStudentsArray.push(modifiedStudent)

  // fs.writeFileSync(studentsFilePath, JSON.stringify(newStudentsArray))
  await writeDB(studentsPathFile, newStudentsArray)
  res.send("Modify user route")
})

//Add Project to Student
router.post("/:id/", (req, res) => {
  //get single student

  const studentsFilePath = path.join(__dirname, "students.json")
  const fileAsABuffer = fs.readFileSync(studentsFilePath)
  const fileAsAString = fileAsABuffer.toString()
  const studentsArray = JSON.parse(fileAsAString)
  const idStudent = req.params.id
  console.log("ID STUDENT>", idStudent)
  //get single student
  const singleStudent = studentsArray.find(
    (student) => student.ID === idStudent
  )
  //create array without single student
  const newStudentsArray = studentsArray.filter(
    (student) => student.ID !== req.params.id
  )

  //add project to projects.json

  // path.join(__dirname, "..", "/otherfolder etc
  const projectsFilePath = path.join(__dirname, "../projects", "projects.json")
  const projectBuffer = fs.readFileSync(projectsFilePath)
  const projBuffString = projectBuffer.toString()
  const projectsArray = JSON.parse(projBuffString)

  const newProject = req.body
  console.log(newProject)
  newProject.ID = singleStudent.ID // maybe should have student it
  projectsArray.push(newProject)
  fs.writeFileSync(projectsFilePath, JSON.stringify(projectsArray))

  //add project to single student
  singleStudent.projects.push(newProject)

  //add modified student to newStudentsArray
  newStudentsArray.push(singleStudent)

  fs.writeFileSync(studentsFilePath, JSON.stringify(newStudentsArray))
  res.send("Added project to student")
})

//DELETE

// CRUD

// POST  OBJECT AND DB NAME => WRITE
// GET SINGLE READ => ID AND DB RETURN SINGLE OBJ
//  GET READ ALL
//  PUT UPDATE => ID , OBJC TO UPDATE => UPDATE

// ID => DELETE

router.delete("/:id", (req, res) => {
  const studentsFilePath = path.join(__dirname, "students.json")
  const fileAsABuffer = fs.readFileSync(studentsFilePath)
  const fileAsAString = fileAsABuffer.toString()
  const studentsArray = JSON.parse(fileAsAString)

  const newStudentsArray = studentsArray.filter(
    (student) => student.ID !== req.params.id
  )

  fs.writeFileSync(studentsFilePath, JSON.stringify(newStudentsArray))

  res.status(204).send()
})

//upload pictures

const studentsFolderPath = path.join(__dirname, "../../../public/img/students")

router.post("/:id/upload", upload.single("student"), async (req, res, next) => {
  const id = req.params.id
  console.log(id)

  try {
    await writeFile(path.join(studentsFolderPath, `${id}.jpg`), req.file.buffer)

    const studentsArr = await readDB(studentsPathFile)
    let singleStudent = await studentsArr.find((student) => student.ID === id)
    singleStudent = {
      ...singleStudent,
      image: `http://localhost:3001/img/students/${singleStudent.ID}.jpg)`,
      modifiedAt: new Date(),
    }

    const modifiedArray = await studentsArr.filter(
      (student) => student.ID !== id
    )

    await modifiedArray.push(singleStudent)
    await writeDB(studentsPathFile, modifiedArray)

    res.send("ok")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router
