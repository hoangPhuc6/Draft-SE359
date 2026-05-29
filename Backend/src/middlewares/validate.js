const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
    value: e.value,
  }));

  const err = new Error("Validation failed");
  err.statusCode = 422;
  err.errors = errors;
  return next(err);
};

module.exports = validate;
