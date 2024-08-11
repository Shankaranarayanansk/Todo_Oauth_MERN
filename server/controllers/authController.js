const jwt = require("jsonwebtoken");

exports.googleCallback = (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });
  res.redirect(`http://localhost:9000?token=${token}`);
};