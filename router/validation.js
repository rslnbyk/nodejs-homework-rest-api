const joi = require("joi");

const schemaPostContact = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email(),
  phone: joi
    .string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/),
  favorite: joi.boolean(),
});

const schemaPutContact = joi.object({
  name: joi.string().min(3),
  email: joi.string().email(),
  phone: joi
    .string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/),
});

const schemaPostUser = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  subscription: joi.string(),
});

const schemaLoginUser = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
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
  schemaPostContact,
  schemaPutContact,
  schemaPostUser,
  schemaLoginUser,
  validateBody,
};
