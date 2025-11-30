const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");

const isAuthenticated = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];

      // Verify token
      const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Get user from token
      const patient = await Patient.findById(userId).select("-password -tokens");
      if (!patient) {
        return res.status(401).json({ status: "failed", message: "Unauthorized User" });
      }

      req.user = { id: patient._id, email: patient.email, is_admin: patient.is_admin };
      next();
    } catch (error) {
      return res.status(401).json({ status: "failed", message: "Unauthorized User" });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized User, No Token",
    });
  }
};

module.exports = isAuthenticated;