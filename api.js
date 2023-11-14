const express = require("express");
const router = express.Router();

const customer = require("./Routes/Customer");

router.use("/customer", customer);

module.exports=router;
