const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { Ordered_items } = require("../Schema/OrderSchema");

// API for restaurant to get Orders
router.post("/getorders", async (req, res)=>{
    try{
        const decodedRToken = jwt.verify(req.headers.authorization, "mysecretkey");
        const allOrdersList = await Ordered_items.find({item_restaurant_id:decodedRToken._id});
        if(allOrdersList){
            res.status(200).send({allOrdersList});
        }
    }
    catch(e){
        res.status(500).send({msg:"Internal Server Error"});
    }
});

// API for restaurant to update order status
router.put("/update_orderstatus", async (req, res)=>{
    try{
        const {_id, order_status}=req.body;
        const updateOrderStatus = await Ordered_items.findOneAndUpdate({_id:_id},{order_status:order_status});
        if(updateOrderStatus){
            res.status(200).send({updateOrderStatus});
        }
    }
    catch(e){
        res.status(500).send({msg:"Internal Server Error"});
    }
});

module.exports=router;