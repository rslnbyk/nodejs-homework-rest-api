const User = require("../service/schemas/user");
const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const gravatar = require("gravatar");
const fs = require("fs").promises;
const path = require("node:path");
const formatImg = require("../utils/formatImg");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const singUpUser = async (req, res, next) => {
  const { email, password, subscription = "starter" } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
    });
  }
  try {
    const avatarUrl = gravatar.url(email);
    const newUser = new User({ email, subscription, avatarUrl });
    newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarUrl: newUser.avatarUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Incorrect email or password",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  const updatedUser = await User.findByIdAndUpdate(
    { _id: payload.id },
    { token },
    { new: true }
  );
  res.json({
    status: "success",
    code: 200,
    data: {
      token,
      user: {
        email: updatedUser.email,
        subscription: updatedUser.subscription,
        avatarUrl: updatedUser.avatarUrl,
      },
    },
  });
};

const logOutUser = async (req, res, next) => {
  await User.findOneAndUpdate({ email: req.user.email }, { token: null });
  res.status(204).json({
    status: "error",
    code: 204,
    message: "No content",
  });
};

const currentUser = async (req, res, next) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    status: "success",
    code: 200,
    data: {
      user: { email, subscription },
    },
  });
};

const updateAvatar = async (req, res, next) => {
  const userId = req.user._id.toString();
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "No file attached",
    });
  }
  const { path: tempName } = req.file;
  const uploadDir = path.join(process.cwd(), "./public/avatars");

  try {
    const fileName = path.join(uploadDir, `${userId}.jpg`);
    await formatImg(tempName);

    const avatarUrl = `http://localhost:3000/api/users/avatars/${userId}.jpg`;
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        avatarUrl,
      }
    );
    await fs.rename(tempName, fileName);

    res.status(200).json({
      status: "success",
      code: 200,
      data: { avatarUrl },
    });
  } catch (error) {
    fs.unlink(tempName);
    next(error);
  }
};

module.exports = {
  auth,
  singUpUser,
  loginUser,
  logOutUser,
  currentUser,
  updateAvatar,
};
