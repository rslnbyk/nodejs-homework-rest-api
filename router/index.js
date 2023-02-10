const express = require("express");
const router = express.Router();
const upload = require("../controller/upload");
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  updateFavoriteContact,
  removeContact,
} = require("../controller/contacts");
const {
  auth,
  singUpUser,
  loginUser,
  logOutUser,
  currentUser,
  updateAvatar,
} = require("../controller/users");
const {
  schemaPostContact,
  schemaPutContact,
  schemaPostUser,
  schemaLoginUser,
  SchemaFavoriteContact,
} = require("../utils/validation/validationSchemas");
const { validateBody } = require("../utils/validation/validateBody");

router.get("/contacts", auth, getContacts);

router.get("/contacts/:id", auth, getContactById);

router.post("/contacts", auth, validateBody(schemaPostContact), createContact);

router.put(
  "/contacts/:id",
  auth,
  validateBody(schemaPutContact),
  updateContact
);

router.patch(
  "/contacts/:id/favorite",
  auth,
  validateBody(SchemaFavoriteContact),
  updateFavoriteContact
);

router.delete("/contacts/:id", auth, removeContact);

router.post("/users/signup", validateBody(schemaPostUser), singUpUser);

router.post("/users/login", validateBody(schemaLoginUser), loginUser);

router.get("/users/logout", auth, logOutUser);

router.get("/users/current", auth, currentUser);

router.patch("/users/avatars", auth, upload.single("avatar"), updateAvatar);

module.exports = router;
