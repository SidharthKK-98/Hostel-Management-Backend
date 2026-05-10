const cron = require("node-cron");
const User = require("../models/user");

cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Resetting isFeesPayed for all users...");

    await User.updateMany(
      {},
      { $set: { isFeesPayed: false } }
    )

    console.log("Reset completed");
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});