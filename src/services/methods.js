const { readDB, writeDB } = require("../utils/utilities")
const uniqid = require("uniqid")

const Crud = {
  createObject: async (req, path, ...params) => {
    if (params.length > 0) {
      console.log("params are:", params)
    } else {
      const arrayOfItems = await readDB(path)
      const newItem = {
        ...req.body,
        ID: uniqid(),
        modifiedAt: new Date(),
      }
      arrayOfItems.push(newItem)
      await writeDB(path, arrayOfItems)
      return newItem.ID
    }
  },

  readObject: async (req, path, ...params) => {
    const arrayOfItems = await readDB(path)

    if (params.length > 0) {
      console.log("id of item is: ", params[0])
      const id = params[0]
      const item = arrayOfItems.find((item) => item.ID === id)
      if (!item) {
        const err = new Error()
        err.httpStatusCode = 404
        return err
      } else {
        return item
      }
    } else {
      console.log("it works")
      return arrayOfItems
    }
  },
  updateObject: () => {},
  deleteObject: () => {},
}

module.exports = { Crud }
