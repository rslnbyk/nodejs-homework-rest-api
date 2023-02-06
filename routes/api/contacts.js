const express = require("express");
const joi = require("joi");

const validatePost = (user) => {
  const schema = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email().required(),
    phone: joi
      .string()
      .pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/)
      .required(),
  });
  if (schema.validate(user).error) {
    return false;
  }
  return true;
};

const validatePut = (user) => {
  const schema = joi.object({
    name: joi.string().min(3),
    email: joi.string().email(),
    phone: joi
      .string()
      .pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/),
  });
  if (schema.validate(user).error) {
    return false;
  }
  return true;
};

const router = express.Router();
const contacts = require("../../models/contacts");

router.get("/", async (req, res, next) => {
  const contactsList = await contacts.listContacts();
  res.status(200).json({ data: contactsList });
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const contact = await contacts.getContactById(id);
  if (!contact) {
    res.status(404).json({ message: "Not found" });
  } else {
    res.status(200).json({ data: contact });
  }
});

router.post("/", async (req, res, next) => {
  const isValid = validatePost(req.body);
  if (!isValid) {
    res.status(400).json({ message: "missing required field" });
  } else {
    const contactsList = await contacts.listContacts();
    const newId = Number(contactsList[contactsList.length - 1].id) + 1;
    const newContact = { id: newId.toString(), ...req.body };
    await contacts.addContact(newContact);
    res.status(201).json({ data: newContact });
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const contact = await contacts.getContactById(id);
  if (!contact) {
    res.status(404).json({ message: "Not found" });
  } else {
    await contacts.removeContact(id);
    res.status(200).json({ message: "contact deleted" });
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const isValid = (name || email || phone) && validatePut(req.body);
  if (!isValid) {
    res.status(400).json({ message: "missing fields" });
  } else {
    const contact = await contacts.getContactById(id);
    if (!contact) {
      res.status(404).json({ message: "Not found" });
    } else {
      await contacts.updateContact(id, req.body);
      const updatedContact = await contacts.getContactById(id);
      res.status(200).json({ data: updatedContact });
    }
  }
});

module.exports = router;
