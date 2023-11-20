const mongoose = require("mongoose");

const cart = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
    },
    food_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food_List",
    },
    selected_quantity: {
        type: Number,
        required: true,
    },
});

const shopping_session = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
    },
    total_price: {
        type: Number,
        required: true,
    },
});

const Cart = mongoose.model("cart", cart);
const Session = mongoose.model("shopping_session", shopping_session);
module.exports = { Cart, Session };