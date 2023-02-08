const express = require("express");
const router = express.Router();
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  updateFavoriteContact,
  removeContact,
} = require("../controller");
const validation = require("./validation");

router.get("/", getContacts);

router.get("/:id", getContactById);

router.post("/", validation.validateBody(validation.schemaPost), createContact);

router.put(
  "/:id",
  validation.validateBody(validation.schemaPut),
  updateContact
);

router.patch("/:id/favorite", updateFavoriteContact);

router.delete("/:id", removeContact);

module.exports = router;
