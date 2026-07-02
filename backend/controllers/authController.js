const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

return res.json({
  success: true,
  token,
  user,
});