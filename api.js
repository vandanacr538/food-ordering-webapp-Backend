const express = require("express");
const router = express.Router();

const customer = require("./Routes/Customer");
const restaurant = require("./Routes/Restaurant");

router.use("/customer", customer);
router.use("/restaurant", restaurant);

module.exports=router;
