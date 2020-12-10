const express = require("express")
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { pipeline } = require("stream")
const zlib = require("zlib")
const { join } = require("path")

const router = express.Router()

const upload = multer({})

const studentsFolderPath = join(__dirname, "../../../public/img/students")

router.post("/:id/upload", upload.single("avatar"), async (req, res, next) => {
  const id = req.params.id
  console.log(id)

  //   try {
  //     await writeFile(
  //       join(studentsFolderPath, req.file.originalname),
  //       req.file.buffer
  //     )
  //     res.send("ok")
  //   } catch (error) {
  //     console.log(error)
  //     next(error)
  //   }
})

router.post(
  "/uploadMultiple",
  upload.array("multipleAvatar", 2),
  async (req, res, next) => {
    try {
      const arrayOfPromises = req.files.map((file) =>
        writeFile(join(studentsFolderPath, file.originalname), file.buffer)
      )
      await Promise.all(arrayOfPromises)
      res.send("ok")
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

router.get("/:name/download", (req, res, next) => {
  const source = createReadStream(
    join(studentsFolderPath, `${req.params.name}`)
  )
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${req.params.name}.gz`
  ) //asks browser to propmt the save on window
  pipeline(source, zlib.createGzip(), res, (error) => next(error))
})

module.exports = router

/*

1 upload single file route

2 upload multiple files route

3 download file route 
*/

// const express = require("express")
// const multer = require("multer")
// const { writeFile } = require("fs-extra")
// const { join } = require("path")

// const router = express.Router()

// const uploadMiddleware = multer({})

// const studentsPublicFolder = join(__dirname, "../../../public/img/students")

// router.post(
//   "/uploadPicture",
//   uploadMiddleware.single("avatar"),
//   async (req, res, next) => {
//     //before the execution goes in the route handler multer will be parsing the body of the request, to grab the uploaded file
//     try {
//       await writeFile()
//     } catch (err) {}
//   }
// )

// module.exports = router
