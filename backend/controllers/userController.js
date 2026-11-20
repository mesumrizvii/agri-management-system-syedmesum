const { Op } = require("sequelize");
const { User } = require("../models/associations");
const generateToken = require("../utils/generateToken");
const { ok, fail } = require("../utils/response");

const safe = (u) => ({ id: u.id, fullName: u.fullName, username: u.username, email: u.email, role: u.role });

// POST /api/users/register (public) -> always creates a MANAGER. Only an admin can make another admin.
exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (!fullName || !username || !email || !password) return fail(res, "All fields are required");
    if (password.length < 6) return fail(res, "Password must be at least 6 characters");
    const exists = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (exists) return fail(res, "Username or email already in use", 409);
    const user = await User.create({ fullName, username, email, password, role: "manager" });
    return ok(res, safe(user), "Account created. Please log in.", 201);
  } catch (e) {
    return fail(res, e.errors?.[0]?.message || e.message, 500);
  }
};

// POST /api/users/login (public) -> response.data.user holds the token (matches the LOGIN action)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body; // username can also be the email
    if (!username || !password) return fail(res, "Username and password are required");
    const user = await User.findOne({ where: { [Op.or]: [{ username }, { email: username }] } });
    if (!user || !(await user.matchPassword(password))) return fail(res, "Invalid username or password", 401);
    return res.json({
      succeeded: true,
      message: "Login successful",
      user: { ...safe(user), token: generateToken(user) },
    });
  } catch (e) {
    return fail(res, e.message, 500);
  }
};

exports.me = async (req, res) => ok(res, safe(req.user)); // GET /api/users/me
exports.logout = async (req, res) => ok(res, null, "Logged out"); // token is dropped on the client

// POST /api/users/change-password (logged-in user)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return fail(res, "Current and new password are required");
    if (newPassword.length < 6) return fail(res, "Password must be at least 6 characters");
    const user = await User.findByPk(req.user.id);
    if (!(await user.matchPassword(currentPassword))) return fail(res, "Current password is incorrect", 401);
    await user.update({ password: newPassword });
    return ok(res, null, "Password changed");
  } catch (e) {
    return fail(res, e.message, 500);
  }
};

// GET /api/users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] }, order: [["createdAt", "DESC"]] });
    return ok(res, { users });
  } catch (e) {
    return fail(res, e.message, 500);
  }
};

// GET /api/users/:id (admin)
exports.getUser = async (req, res) => {
  try {
    const u = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
    return u ? ok(res, u) : fail(res, "User not found", 404);
  } catch (e) {
    return fail(res, e.message, 400);
  }
};

// POST /api/users (admin: can set role)
exports.createUser = async (req, res) => {
  try {
    const u = await User.create(req.body);
    return ok(res, safe(u), "User created", 201);
  } catch (e) {
    return fail(res, e.errors?.[0]?.message || e.message);
  }
};

// PUT /api/users/:id (admin)
exports.updateUser = async (req, res) => {
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return fail(res, "User not found", 404);
    const body = { ...req.body };
    if (!body.password) delete body.password; // empty password = keep the old one
    await u.update(body);
    return ok(res, safe(u), "User updated");
  } catch (e) {
    return fail(res, e.errors?.[0]?.message || e.message);
  }
};

// DELETE /api/users/:id (admin)
exports.removeUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return fail(res, "You cannot delete your own account");
    const n = await User.destroy({ where: { id: req.params.id } });
    return n ? ok(res, { id: req.params.id }, "User removed") : fail(res, "User not found", 404);
  } catch (e) {
    return fail(res, e.message, 400);
  }
};
