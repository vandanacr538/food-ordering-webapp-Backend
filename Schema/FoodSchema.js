const mongoose = require("mongoose");

const food_list = new mongoose.Schema({
    restaurant_id:{
        type:String,
        required:true
    },
    item_name:{
        type:String,
        required:true
    },
    item_quantity:{
        type:Number,
        required:true
    },
    item_price:{
        type:String,
        required:true
    },
    item_description:{
        type:String,
        required:true
    },
    item_picture_url:{
        type:String,
        required:true
    }
});

const Food_List = mongoose.model("food_list", food_list);
module.exports = Food_List;