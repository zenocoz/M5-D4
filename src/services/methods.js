const { readDB, writeDB } = require("../utils/utilities")

const Crud = {
  createObject: async (req, path) => {
    const arrayOfItems = await readDB(path)
    const newItem = {
      ...req.body,
      ID: uniqid(),
      modifiedAt: new Date(),
    }
    arrayOfItems.push(newItem)
    await writeDB(path, arrayOfItems)
    return newItem.ID
  },

  readObject: () => {},
  updateObject: () => {},
  deleteObject: () => {},
}
