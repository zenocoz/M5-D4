const { readDB, writeDB } = require("../utils/utilities")
const uniqid = require("uniqid")

const Crud = {
  createObject: async (req, path, ...params) => {
    if (params.length > 0) {
      console.log("params are:", params)
      //add property to object

      //   const arrayOfItems = await readDB(path)
      //   const singleItem = arrayOfItems.find((item) => item.ID === params[0])

      //   const arrayOfOtherItems = await readDB(params[1])

      //   const newOtherItem = req.body
      //   newOtherItem.ID = uniqid()
      //   arrayOfOtherItems.push(newOtherItem)

      //   singleItem[req.body.]
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
  updateObject: async (req, path, id) => {},
  deleteObject: () => {},
}

module.exports = { Crud }
