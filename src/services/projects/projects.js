const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const uniqid = require("uniqid")
const { check, validationResult } = require("express-validator")
const { nextTick } = require("process")

const readFile = (fileName) => {
  const buf = fs.readFileSync(path.join(__dirname, fileName))
  const content = buf.toString()
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

//   router.put("/:id", (req, res) => {
//     const users = readFile("users.json")
//     const newUsers = users.filter((user) => user.ID !== req.params.id)
//     const modifiedUser = {
//       ...req.body,
//       ID: req.params.id,
//       modifiedAt: new Date(),
//     }

//     newUsers.push(modifiedUser)
//     fs.writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(newUsers))
//     res.send({ id: modifiedUser.ID })
//   })

//   router.delete("/:id", (req, res) => {
//     const users = readFile("users.json")
//     const modifiedUsers = users.filter((user) => user.ID !== req.params.id)
//     fs.writeFileSync(
//       path.join(__dirname, "users.json"),
//       JSON.stringify(modifiedUsers)
//     )
//     res.status(204).send()
//   })

module.exports = router
