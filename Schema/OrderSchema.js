const mongoose = require("mongoose");

const order_detail = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
    },
    total_price: {
        type: Number,
        required: true,
    },
    payment_id: {}
});

const ordered_item = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order_details",
    },
    food_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food_List",
    },
    ordered_item_quantity: {
        type: Number,
        required: true,
    },
});

const Order_details = mongoose.model("order_detail", order_detail);
const Ordered_items = mongoose.model("ordered_item", ordered_item);

module.exports={Order_details, Ordered_items};

