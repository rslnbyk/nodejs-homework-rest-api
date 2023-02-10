const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(error);
    }
    next(error);
  };
};

module.exports = { validateBody };
