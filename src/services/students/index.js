//-----------------------------TOOLS AND MIDDLEWARE--------------------------------------
const express = require("express")
const fs = require("fs") //core nodejs module (file system)
const path = require("path") //core module, i will be sure to be safely creating paths
const uniqid = require("uniqid") //third party module
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { pipeline } = require("stream")
const { readDB, writeDB } = require("../../utils/utilities")
const { Crud } = require("../methods")

//Middleware Instances
const router = express.Router() //lets me create a collection of endpoints(router.get(), router.post() ecc)
const upload = multer({})

//Paths
const studentsPathFile = path.join(__dirname, "students.json")

//route 1 GET
router.get("/", async (req, res, next) => {
  try {
    const students = await Crud.readObject(req, studentsPathFile)
    res.send(students)
  } catch (error) {
    next(error)
  }
})

//GET single student

router.get("/:id", async (req, res, next) => {
  const idComingFromRequest = req.params.id
  const student = await Crud.readObject(
    req,
    studentsPathFile,
    idComingFromRequest
  )
  res.send(student)
})

//POST
router.post("/", async (req, res, next) => {
  //TODO check for errors

  const newStudentId = await Crud.createObject(req, studentsPathFile)
  res.status(201).send({ "student added with id": newStudentId })
})

//PUT
router.put("/:id", async (req, res, next) => {
  const studentsArray = await readDB(studentsPathFile)

  const newStudentsArray = await studentsArray.filter(
    (student) => student.ID !== req.params.id
  )

  const modifiedStudent = req.body
  modifiedStudent.ID = req.params.id

  newStudentsArray.push(modifiedStudent)

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
      image: `http://localhost:3001/img/students/${singleStudent.ID}.jpg`,
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
