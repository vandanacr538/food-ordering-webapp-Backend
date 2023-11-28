const express = require("express");
const router = express.Router();

const customer = require("./Routes/Customer");
const restaurant = require("./Routes/Restaurant");
const restaurant_food = require("./Routes/RestaurantFood");
const cart = require("./Routes/CustomerCart");
const orders = require("./Routes/Orders");

router.use("/customer", customer);
router.use("/restaurant", restaurant);
router.use("/restaurant_food", restaurant_food);
router.use("/cart", cart);
router.use("/order", orders);

module.exports=router;
