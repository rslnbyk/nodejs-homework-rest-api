const User = require("../service/schemas/user");
const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");
const passport = require("passport");

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
    const newUser = new User({ email, subscription });
    newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: { email: newUser.email, subscription: newUser.subscription },
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

module.exports = {
  auth,
  singUpUser,
  loginUser,
  logOutUser,
  currentUser,
};
