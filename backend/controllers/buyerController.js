const fs = require("fs");
const path = require("path");
const { Buyer, Crop } = require("../models/associations");
const { ok, fail } = require("../utils/response");
const { logActivity } = require("../utils/crudFactory");

const IMAGES_DIR = path.join(__dirname, "../public/Images");
const removePhoto = (photoUrl) => {
  if (!photoUrl) return;
  fs.unlink(path.join(IMAGES_DIR, path.basename(photoUrl)), () => {});
};

// units of this crop already sold to other buyers (excluding one buyer when editing)
const soldQty = async (cropId, excludeId) => {
  const buyers = await Buyer.findAll({ where: { cropId } });
  return buyers.filter((b) => b.id !== excludeId).reduce((s, b) => s + Number(b.quantity), 0);
};

const validate = ({ name, cnic }) => {
  if (!/^[A-Za-z ]{3,}$/.test(name || "")) return "Name must be letters and spaces, minimum 3 characters";
  if (!/^\d{5}-\d{7}-\d$/.test(cnic || "")) return "CNIC must be in the format 12345-1234567-1";
  return null;
};

exports.getAll = async (req, res) => {
  try {
    const rows = await Buyer.findAll({ include: [Crop], order: [["createdAt", "DESC"]] });
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
};

exports.getOne = async (req, res) => {
  try {
    const row = await Buyer.findByPk(req.params.id, { include: [Crop] });
    return row ? ok(res, row) : fail(res, "Buyer not found", 404);
  } catch (e) {
    return fail(res, e.message, 400);
  }
};

// POST /api/buyers  (multipart/form-data, file field name: "photo")
exports.create = async (req, res) => {
  try {
    const { name, cnic, cropId, quantity, date } = req.body;
    const savedFile = req.file && req.file.filename;
    const reject = (msg, status = 400) => {
      if (savedFile) removePhoto(savedFile);
      return fail(res, msg, status);
    };

    const invalid = validate({ name, cnic });
    if (invalid) return reject(invalid);
    if (!req.file) return fail(res, "Buyer photo is required (JPG or PNG, max 1 MB)");
    if (await Buyer.findOne({ where: { cnic } })) return reject("This CNIC is already registered", 409);

    const crop = await Crop.findByPk(cropId);
    if (!crop) return reject("Crop not found", 404);
    const available = Number(crop.harvestQty) - (await soldQty(cropId));
    if (!(Number(quantity) > 0)) return reject("Quantity must be greater than 0");
    if (Number(quantity) > available) return reject(`Only ${available} available in stock`);

    const buyer = await Buyer.create({
      name, cnic, cropId, quantity, date,
      photoUrl: "/images/" + req.file.filename,
      createdBy: req.user.id,
    });
    logActivity(req, "add", "buyer", buyer.id);
    return ok(res, buyer, "Buyer saved", 201);
  } catch (e) {
    if (req.file) removePhoto(req.file.filename);
    return fail(res, e.errors?.[0]?.message || e.message);
  }
};

// PUT /api/buyers/:id (admin) - photo is optional here
exports.update = async (req, res) => {
  try {
    const buyer = await Buyer.findByPk(req.params.id);
    const newFile = req.file && req.file.filename;
    const reject = (msg, status = 400) => {
      if (newFile) removePhoto(newFile);
      return fail(res, msg, status);
    };
    if (!buyer) return reject("Buyer not found", 404);

    const data = {
      name: req.body.name ?? buyer.name,
      cnic: req.body.cnic ?? buyer.cnic,
      cropId: req.body.cropId ?? buyer.cropId,
      quantity: req.body.quantity ?? buyer.quantity,
      date: req.body.date ?? buyer.date,
    };
    const invalid = validate(data);
    if (invalid) return reject(invalid);

    if (data.cnic !== buyer.cnic && (await Buyer.findOne({ where: { cnic: data.cnic } })))
      return reject("This CNIC is already registered", 409);

    const crop = await Crop.findByPk(data.cropId);
    if (!crop) return reject("Crop not found", 404);
    const available = Number(crop.harvestQty) - (await soldQty(data.cropId, buyer.id));
    if (!(Number(data.quantity) > 0)) return reject("Quantity must be greater than 0");
    if (Number(data.quantity) > available) return reject(`Only ${available} available in stock`);

    const oldPhoto = buyer.photoUrl;
    if (newFile) data.photoUrl = "/images/" + newFile;
    await buyer.update(data);
    if (newFile) removePhoto(oldPhoto);
    logActivity(req, "edit", "buyer", buyer.id);
    return ok(res, buyer, "Buyer updated");
  } catch (e) {
    if (req.file) removePhoto(req.file.filename);
    return fail(res, e.errors?.[0]?.message || e.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const buyer = await Buyer.findByPk(req.params.id);
    if (!buyer) return fail(res, "Buyer not found", 404);
    const photo = buyer.photoUrl;
    await buyer.destroy();
    removePhoto(photo);
    logActivity(req, "delete", "buyer", req.params.id);
    return ok(res, { id: req.params.id }, "Buyer removed");
  } catch (e) {
    return fail(res, e.message, 400);
  }
};
