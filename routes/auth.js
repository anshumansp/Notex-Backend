const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authenticate = require("../middleware/checkUser");
const JWT_SECRET = process.env.JWT_SECRET;


// (Route-1) Signing up a User using post request
router.post(
  "/signup",
  [
    // Adding Validation using Express-Validator
    body("name", "Enter a valid Name with minimum 3 characters")
      .isLength({ min: 3 })
      .isString(),
    body("email", "Enter a valid Email").isEmail(),
    body(
      "password",
      "Enter a valid Password with minimum 5 characters"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      // Checking for validation errors and returning bad request on errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors.array()[0].msg
        return res.status(400).json({status: "Error", message: message });
      }

      // Finding if the user with similar email exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
          return res.status(401).json({status: "Error", message: "Signup Failed" });
      }

      // Hashing the password and adding salt
      const salt = await bcrypt.genSaltSync(10);
      const hashPass = await bcrypt.hashSync(req.body.password, salt);

      // Saving the User credentials to the database
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPass,
      });

      // Storing userId payload dataset for the jwt token
      const data = {
        user: {
          id: user.id,
        },
      };

      // Generating a token
      const token = await jwt.sign(data, JWT_SECRET);

      // Sending json response for sucessful process
      res.json({
        status: "Success",
        message: "Successfully Saved the User",
        token: token,
      });

      // Catching the errors and showing the error message
    } catch (err) {
      console.log(err.message);
      res.status(500).json({status: "Error",  message: "Internal Server Error"})
    }
  }
);


// (Route-2) Logging in the Existing User
router.post(
  "/login",
  [
    // Adding Validation using Express-Validator
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password should not be empty").exists(),
  ],
  async (req, res) => {
    try {
      // Checking for validation errors and returning bad request on errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors.array()[0].msg
        return res.status(400).json({status: "Error", message: message });
      }

      // Finding if the user with similar email exists
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({status: "Error", message: "Authentication Failed" });
      }

      // Comparing the Passwords and returning if any error found
      const passwordComparison = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordComparison) {
        return res.status(401).json({status: "Error", message: "Authentication Failed" });
      }

      // Storing userId payload dataset for the jwt token
      const data = {
        user: {
          id: user.id,
        },
      };

      // Generating a token
      const token = jwt.sign(data, JWT_SECRET);

      // Sending the Successful Log in Message
      res.status(200).json({
        status: "Success",
        message: "Authentication Successfull",
        token: token,
      });

    } catch (err) {
      console.log(err.message);
      res.status(500).json({status: "Error",  message: "Internal Server Error"})
    }
  }
);




// (Route-3) Getting the User Details
router.post("/getuser", authenticate, async (req, res) => {
  try {
    // Finding the User by the User Id received in req.user through authentication middleware
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user)
  } catch (err) {
    console.log(err.message);
    res.status(500).json({status: "Error",  message: "Internal Server Error"})
  }
});

module.exports = router;
