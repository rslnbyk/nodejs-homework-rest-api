const express = require("express");
const router = express.Router();
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
} = require("../controller/users");
const validation = require("./validation");

router.get("/contacts", auth, getContacts);

router.get("/contacts/:id", auth, getContactById);

router.post(
  "/contacts",
  auth,
  validation.validateBody(validation.schemaPostContact),
  createContact
);

router.put(
  "/contacts/:id",
  auth,
  validation.validateBody(validation.schemaPutContact),
  updateContact
);

router.patch("/contacts/:id/favorite", auth, updateFavoriteContact);

router.delete("/contacts/:id", auth, removeContact);

router.post(
  "/users/signup",
  validation.validateBody(validation.schemaPostUser),
  singUpUser
);

router.post(
  "/users/login",
  validation.validateBody(validation.schemaLoginUser),
  loginUser
);

router.get("/users/logout", auth, logOutUser);

router.get("/users/current", auth, currentUser);

module.exports = router;
