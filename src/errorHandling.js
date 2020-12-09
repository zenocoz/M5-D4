const notFoundErrorHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 404) {
    res.status(404).send("Error! Not found!")
  }
  next(err)
}

const unauthorizedErrorHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 401) {
    res.send(401).send("Error! Not Authorized!")
  }
  next(err)
}

const forbiddenErrorHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 403) {
    res.status(403).send("Error! Forbidden!")
  }
  next(err)
}

const badRequestErrorHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 400) {
    res.status(400).send("Error! Bad Request!")
  }
  next(err)
}

const catchAllErrorHandler = (err, req, res, next) => {
  if (!res.headersSent) {
    res.status(res.httpStatusCode || 500).send("Error! Generic Server Error")
  }
  next(err)
}

module.exports = {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
}
