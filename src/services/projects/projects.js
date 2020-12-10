//TOOLS AND MIDDLEWARE
const express = require("express")
const fs = require("fs")
const path = require("path")
const uniqid = require("uniqid")
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { check, validationResult } = require("express-validator")
const { nextTick } = require("process")
const { readDB, writeDB } = require("../../utils/utilities")

//Create Middleware Instances
const router = express.Router()
const upload = multer({})

//PATHS
const reviewsFilePath = path.join(__dirname, "reviews.json")
const projectsFilePath = path.join(__dirname, "projects.json")
const projectsFolderPath = path.join(__dirname, "../../../public/img/projects")

//------------------------------------------ENDPOINTS--------------------------------//

//------------Projects Endpoints---------------------------------------//
router.get("/", async (req, res) => {
  try {
    const projects = await readDB(projectsFilePath)
    if (req.query && req.query.name) {
      const filteredProjects = projects.filter(
        (project) =>
          project.hasOwnProperty("name") && project.name === req.query.name
      )
      res.send(filteredProjects)
    } else {
      res.send(projects)
    }
  } catch (error) {
    next(error)
  }
})

router.get("/:id", async (req, res) => {
  try {
    const projects = await readDB(projectsFilePath)
    const singleProject = projects.filter(
      (project) => project.ID === req.params.id
    )
    if (singleProject.length > 0) {
      res.send(singleProject)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    next(error)
  }
})

router.post(
  "/",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("Name is too short")
      .exists()
      .withMessage("Insert name please"),
    check("repo").isURL().withMessage("enter a valid url"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const projects = await readDB(projectsFilePath)
        const newProject = {
          ...req.body,
          ID: uniqid(),
          modifiedAt: new Date(),
        }
        projects.push(newProject)
        fs.writeFileSync(
          path.join(__dirname, "projects.json"),
          JSON.stringify(projects)
        )
        res.status(201).send({ "project created with id": newProject.ID })
      }
    } catch (error) {
      next(error)
    }
  }
)

router.put("/:id", async (req, res) => {
  const projects = await readDB(projectsFilePath)
  const newProjectsArray = projects.filter(
    (project) => project.ID !== req.params.id
  )
  const modifiedProject = {
    ...req.body,
    ID: req.params.id,
    modifiedAt: new Date(),
  }

  newProjectsArray.push(modifiedProject)
  fs.writeFileSync(
    path.join(__dirname, "users.json"),
    JSON.stringify(newProjectsArray)
  )
  res.send({ id: modifiedProject.ID })
})

router.delete("/:id", async (req, res) => {
  const projects = await readDB(projectsFilePath)
  const modifiedProjectsArray = projects.filter(
    (project) => project.ID !== req.params.id
  )
  fs.writeFileSync(
    path.join(__dirname, "projects.json"),
    JSON.stringify(modifiedProjectsArray)
  )
  res.status(204).send("project deleted")
})

//----------------------------------------------Reviews Endpoints--------------------

//get project review
router.get("/:id/reviews/", async (req, res, next) => {
  try {
    console.log(reviewsFilePath)
    const idProject = req.params.id
    const reviewsDB = await readDB(reviewsFilePath)
    if (reviewsDB.length > 0) {
      const filteredReviews = reviewsDB.filter(
        (review) => review.projectID === idProject
      )
      res.send(filteredReviews)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    next(error)
  }
})

router.post(
  "/:id/reviews/",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("No way! Name too short!")
      .exists()
      .withMessage("Insert a name please!"),
  ],
  async (req, res, next) => {
    const idProject = req.params.id
    console.log("ID PROJECT", idProject)

    //add comment to project

    const reviewsDB = await readDB(reviewsFilePath)
    const newReview = {
      ...req.body,
      projectID: idProject,
      modifiedAt: new Date(),
    }
    reviewsDB.push(newReview)
    await writeDB(reviewsFilePath, reviewsDB)
    res.status(201).send({ "added review to project with ID": idProject })

    // try {
    //   const errors = validationResult(req)
    //   if (!errors.isEmpty()) {
    //     const err = new Error()
    //     err.message = errors
    //     err.httpStatusCode = 400
    //     next(err)
    //   } else {
    //     const usersDB = await readDB(usersFilePath)
    //     const newUser = {
    //       ...req.body,
    //       ID: uniqid(),
    //       modifiedAt: new Date(),
    //     }
    //     usersDB.push(newUser)
    //     await writeDB(usersFilePath, usersDB)
    //     res.status(201).send({ id: newUser.ID })
    //   }
    // } catch (error) {
    //   next(error)
    // }
  }
)

//UPLOAD PICTURES

router.post("/:id/upload", upload.single("project"), async (req, res, next) => {
  const id = req.params.id
  console.log(id)

  try {
    await writeFile(path.join(projectsFolderPath, `${id}.jpg`), req.file.buffer)

    const projectsArr = await readDB(projectsFilePath)
    let singleProject = await projectsArr.find((project) => project.ID === id)
    // if (singleProject.hasOwnProperty("image")) {}

    singleProject = {
      ...singleProject,
      image: `http://localhost:3001/img/projects/${singleProject.ID}.jpg)`,
      modifiedAt: new Date(),
    }
    // singleProject.image = `http://localhost:3001/img/projects/${singleProject.ID}.jpg)`
    // console.log(singleProject)

    const modifiedArray = await projectsArr.filter(
      (project) => project.ID !== id
    )
    await modifiedArray.push(singleProject)
    await writeDB(projectsFilePath, modifiedArray)

    res.send("ok")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router
