const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Expense = sequelize.define(
  "Expense",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cropId: { type: DataTypes.UUID }, // optional
    category: { type: DataTypes.ENUM("Seeds", "Fertilizer", "Labour", "Fuel", "Repair", "Other"), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    note: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.UUID },
  },
  { tableName: "expenses", timestamps: true }
);
module.exports = Expense;
