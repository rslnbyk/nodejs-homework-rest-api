const express = require("express");
const router = express.Router();
const ctrlContact = require("../controller");
const validation = require("./validation");

router.get("/", ctrlContact.get);

router.get("/:id", ctrlContact.getById);

router.post(
  "/",
  validation.validateBody(validation.schemaPost),
  ctrlContact.create
);

router.put(
  "/:id",
  validation.validateBody(validation.schemaPut),
  ctrlContact.update
);

router.patch("/:id/favorite", ctrlContact.updateFavorite);

router.delete("/:id", ctrlContact.remove);

module.exports = router;
