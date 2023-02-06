const express = require("express");
const validation = require("./validation");

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

router.post(
  "/",
  validation.validateBody(validation.schemaPost),
  async (req, res, next) => {
    const contactsList = await contacts.listContacts();
    const newId = Number(contactsList[contactsList.length - 1].id) + 1;
    const newContact = { id: newId.toString(), ...req.body };
    await contacts.addContact(newContact);
    res.status(201).json({ data: newContact });
  }
);

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

router.put(
  "/:id",
  validation.validateBody(validation.schemaPut),
  async (req, res, next) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const isValid = name || email || phone;
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
  }
);

module.exports = router;
