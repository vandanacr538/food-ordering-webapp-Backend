const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Customers = require("../Schema/CustomerSchema");

// API for Customer Sign Up
router.post("/signup", async(req, res)=>{
    const {customer_name, customer_email, customer_mobilenum, customer_password}=req.body;
    const newCustomerData = {
        customer_name:customer_name,
        customer_email:customer_email,
        customer_mobilenum:customer_mobilenum,
        customer_password:customer_password
    }
    const customerExist = await Customers.findOne({customer_email: customer_email});
    if(customerExist){
        res.status(200).send({msg:"A customer already exists with the email provided, Please try to login", token:"customer-already-exists"});
    }
    else{
        const customer = new Customers(newCustomerData);
        const newCustomerAdded = await customer.save();
        if(newCustomerAdded){
            const jwtToken = jwt.sign(newCustomerAdded.toJSON(), "mysecretkey");
            res.status(200).send({msg:"User Added successfully", token:jwtToken});
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
});

// API for Customer Login
router.post("/login", async(req, res)=>{
    const {customer_email, customer_password} = req.body;
    const customerExist = await Customers.findOne({customer_email:customer_email});
    console.log(customerExist);
    if(customerExist){
        if(customerExist.customer_password===customer_password){
            const customerData = {cust_id:customerExist._id};
            const jwtToken = jwt.sign(customerData, "mysecretkey");
            console.log(jwtToken);
            res.status(200).send({msg:"Login successful", token:jwtToken});
        }
        else{
            res.status(403).send({msg:"Your email or password is incorrect"});
        }
    }
    else{
        res.status(401).send({msg:"Customer is not registered with this email address, Please SignUp to register"});
    }
});

module.exports=router;
