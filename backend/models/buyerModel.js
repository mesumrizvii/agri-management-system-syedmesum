const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Buyer = sequelize.define(
  "Buyer",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(80), allowNull: false },
    cnic: { type: DataTypes.STRING(15), allowNull: false, unique: true }, // 12345-1234567-1
    photoUrl: { type: DataTypes.STRING },
    cropId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    createdBy: { type: DataTypes.UUID },
  },
  { tableName: "buyers", timestamps: true }
);
module.exports = Buyer;
