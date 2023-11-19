const express = require("express");
const router = express.Router();

const customer = require("./Routes/Customer");
const restaurant = require("./Routes/Restaurant");
const restaurant_food = require("./Routes/RestaurantFood");

router.use("/customer", customer);
router.use("/restaurant", restaurant);
router.use("/restaurant_food", restaurant_food);

module.exports=router;
