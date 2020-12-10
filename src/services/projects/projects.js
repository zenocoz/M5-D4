const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const uniqid = require("uniqid")
const { check, validationResult } = require("express-validator")
const { nextTick } = require("process")
const { readDB, writeDB } = require("../../utils/utilities")

const reviewsFilePath = path.join(__dirname, "reviews.json")
const projectsFilePath = path.join(__dirname, "projects.js")

const readFile = (fileName) => {
  const buf = fs.readFileSync(path.join(__dirname, fileName))
  const content = buf.toString()
  console.log(__dirname)
  return JSON.parse(content)
}

router.get("/", (req, res) => {
  try {
    const projects = readFile("projects.json")
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

router.get("/:id", (req, res) => {
  try {
    const projects = readFile("projects.json")
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
  (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const projects = readFile("projects.json")
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
        res.status(201).send({ id: newProject.ID })
      }
    } catch (error) {
      next(error)
    }
  }
)

router.put("/:id", (req, res) => {
  const projects = readFile("projects.json")
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

router.delete("/:id", (req, res) => {
  const projects = readFile("projects.json")
  const modifiedProjectsArray = projects.filter(
    (project) => project.ID !== req.params.id
  )
  fs.writeFileSync(
    path.join(__dirname, "projects.json"),
    JSON.stringify(modifiedProjectsArray)
  )
  res.status(204).send()
})

//Reviews Section

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

module.exports = router
