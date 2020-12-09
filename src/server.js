const express = require("express")
const studentsRoutes = require("./students")
const cors = require("cors")

const server = express()
const port = 3001

server.use(cors())
server.use(express.json())

server.use("/students", studentsRoutes)
server.listen(port, () => console.log("server is running on port:", port))
