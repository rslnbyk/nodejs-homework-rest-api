const joi = require("joi");

const schemaPost = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email(),
  phone: joi
    .string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/),
  favorite: joi.boolean(),
});

const schemaPut = joi.object({
  name: joi.string().min(3),
  email: joi.string().email(),
  phone: joi
    .string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/),
});

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(error);
    }
    next(error);
  };
};

module.exports = {
  schemaPost,
  schemaPut,
  validateBody,
};
