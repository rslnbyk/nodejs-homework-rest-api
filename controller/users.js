const User = require("../service/schemas/user");
const secret = process.env.SECRET;
const sgToken = process.env.SENDGRID_TOKEN;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const gravatar = require("gravatar");
const fs = require("fs").promises;
const path = require("node:path");
const formatImg = require("../utils/formatImg");
const nanoid = require("nanoid");
const sgMail = require("@sendgrid/mail");

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
    const verificationToken = nanoid();
    const newUser = new User({
      email,
      subscription,
      avatarUrl,
      verificationToken,
      verify: false,
    });
    newUser.setPassword(password);
    await newUser.save();

    sgMail.setApiKey(sgToken);
    const msg = {
      to: email,
      from: "rslnbyk@gmail.com",
      subject: `Email verification`,
      text: `http://localhost:3000/api/users/verify/${verificationToken}`,
    };
    await sgMail.send(msg);

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

  if (!user.verify) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Email is not verified",
    });
  }

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

const verifyUser = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "User not found",
    });
  }

  await User.findOneAndUpdate(
    { verificationToken },
    { verificationToken: null, verify: true }
  );

  return res.status(200).json({
    status: "success",
    code: 200,
    message: "Verification successful",
  });
};

const verifyUserAgain = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Incorrect email",
    });
  }

  const { verify, verificationToken } = user;
  if (verify) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Verification has already been passed",
    });
  }

  sgMail.setApiKey(sgToken);
  const msg = {
    to: email,
    from: "rslnbyk@gmail.com",
    subject: `Email verification`,
    text: `http://localhost:3000/api/users/verify/${verificationToken}`,
  };
  await sgMail.send(msg);

  return res.status(200).json({
    status: "success",
    code: 200,
    message: "Verification email sent",
  });
};

module.exports = {
  auth,
  singUpUser,
  loginUser,
  logOutUser,
  currentUser,
  updateAvatar,
  verifyUser,
  verifyUserAgain,
};
