const User = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email, isDelete: false });
    if (user) {
      return res.json({ message: "User Already Exists..." });
    }
    let hashpassword = await bcrypt.hash(req.body.password, 10);
    // console.log(hashpassword)
    user = await User.create({ ...req.body, password: hashpassword });
    res.status(201).json({ user, message: "Register Successfully..." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email, isDelete: false });
    if (!user) {
      return res.json({ message: "User Not Found..." });
    }
    let comparedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    // console.log(comparedPassword)
    if (!comparedPassword) {
      return res.json({ message: "Email Or Password Not Match..." });
    }

    let token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ message: "Login Success...", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error..." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error..." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let user = req.user;
    user = await User.findByIdAndUpdate(
      user._id,
      { $set: req.body },
      { new: true }
    );
    console.log(user);
    res
      .status(202)
      .json({ user, message: "User Profile Updated............." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error..." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    let user = req.user;
    user = await User.findById(user._id, { isDelete: false });
    if (!user) {
      return res.json({ message: "User is not Found !!!" });
    }
    user = await User.findByIdAndUpdate(user._id, { isDelete: true });
    res.json({ user, message: "User delete sucess !!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error..." });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    let userId = req.user._id;
    let { oldPassword, newPassword, confirmPassword } = req.body;

    let user = req.user;
    user = await User.findById(userId);
    if (!user) return res.json({ message: "User is not found.." });

    const isSamePassword = await bcrypt.compare(oldPassword, user.password);
    if (!isSamePassword) return res.json({ message: "Invalid old password" });

    if (oldPassword === newPassword) {
      return res.json({
        message: "Old password and new password are the same",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.json({
        message: "New password and confirm password do not match",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error..." });
  }
};