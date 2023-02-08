const Contact = require("../service/schemas/contact");

const getContacts = async (req, res, next) => {
  try {
    const results = await Contact.find();
    res.json({
      status: "success",
      code: 200,
      data: {
        contacts: results,
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getContactById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await Contact.findOne({ _id: id });
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const createContact = async (req, res, next) => {
  const { name, email, phone, favorite = false } = req.body;
  try {
    const result = await Contact.create({ name, email, phone, favorite });

    res.status(201).json({
      status: "success",
      code: 201,
      data: { contact: result },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateContact = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    if (!name && !email && !phone) {
      res.status(400).json({
        status: "error",
        code: 400,
        data: { message: "Missing fields" },
      });
    }
    const result = await Contact.findByIdAndUpdate(
      { _id: id },
      { name, email, phone },
      { new: true }
    );
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateFavoriteContact = async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;

  try {
    if (!req.body || !favorite) {
      res.status(400).json({
        status: "error",
        code: 400,
        data: { message: "Missing field favorite" },
      });
    }
    const result = await Contact.findByIdAndUpdate(
      { _id: id },
      { favorite },
      { new: true }
    );
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const removeContact = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await Contact.findByIdAndRemove({ _id: id });
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { message: "Contact deleted" },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  updateFavoriteContact,
  removeContact,
};
