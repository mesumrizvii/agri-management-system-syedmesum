// run: npm run test:db
const sequelize = require("./config/db");
(async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");
  } catch (e) {
    console.error("Connection failed:", e.message);
  } finally {
    await sequelize.close();
  }
})();
