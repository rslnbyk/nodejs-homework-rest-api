const fs = require("fs/promises");
const path = require("node:path");

const contactsPath = path.resolve(__dirname, "./contacts.json");

const listContacts = async () => {
  const contacts = await fs.readFile(contactsPath);
  const db = JSON.parse(contacts);
  return db;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  return contacts.find((el) => el.id === contactId);
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  contacts.splice(
    contacts.findIndex((el) => el.id === contactId),
    1
  );
  await fs.writeFile(contactsPath, JSON.stringify(contacts));
};

const addContact = async (body) => {
  const contacts = await listContacts();
  contacts.push(body);
  await fs.writeFile(contactsPath, JSON.stringify(contacts));
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const contact = await getContactById(contactId);
  Object.keys(body).forEach((el) => {
    contact[el] = body[el];
  });
  contacts.splice(
    contacts.findIndex((el) => el.id === contactId),
    1,
    contact
  );
  await fs.writeFile(contactsPath, JSON.stringify(contacts));
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
