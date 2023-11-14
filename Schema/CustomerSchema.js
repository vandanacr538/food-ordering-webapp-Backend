const mongoose = require("mongoose");

const customer = new mongoose.Schema({
    customer_name:{
        type:String,
        required:true
    },
    customer_email:{
        type:String,
        required:true
    },
    customer_mobilenum:{
        type:Number,
        required:true
    },
    customer_password:{
        type:String,
        required:true
    }
});

const Customers = mongoose.model("customer", customer);
module.exports=Customers;
