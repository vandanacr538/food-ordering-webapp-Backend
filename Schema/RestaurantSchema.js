const mongoose = require("mongoose");

const restaurant = new mongoose.Schema({
    restaurant_name:{
        type:String,
        required:true
    },
    restaurant_email:{
        type:String,
        required:true
    },
    restaurant_address:{
        type:String,
        required:true
    },
    restaurant_openingtime:{
        type:String,
        required:true
    },
    restaurant_closingtime:{
        type:String,
        required:true
    },
    restaurant_password:{
        type:String,
        required:true
    }  
});

const Restaurants = mongoose.model("restaurant", restaurant);
module.exports = Restaurants;