const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { Cart, Session } = require("../Schema/CartSchema");
const Food_List = require("../Schema/FoodSchema");
const { Order_details, Ordered_items } = require("../Schema/OrderSchema");


// API for Customer to add to cart.
router.post("/add_to_cart", async (req, res)=>{
    const {_id, selected_quantity} = req.body;
    const {cust_id}=jwt.verify(req.body.token, "mysecretkey");
    const itemExistsInCart = await Cart.findOne({customer_id:cust_id, food_item_id:_id});

    if(itemExistsInCart){
        const updateItemQuantity = await Cart.findOneAndUpdate(
            { food_item_id:_id, customer_id: cust_id },
            { $set: { selected_quantity: itemExistsInCart.selected_quantity + Number(selected_quantity) } }
        );
        console.log(updateItemQuantity);
        if(updateItemQuantity){
            console.log(updateItemQuantity);
            const getAllCartItemsForCust = await Cart.find({customer_id:cust_id});
            if(getAllCartItemsForCust){
                let itemsInCart = getAllCartItemsForCust.map(async (element) => {
                    return {
                      fim: await Food_List.findById(element.food_item_id),
                      quan: element.selected_quantity,
                    };
                });
                Promise.all(itemsInCart).then(async (response)=>{
                    let shoppingTotal=0;
                    response.forEach((element)=>{
                        shoppingTotal=shoppingTotal+element.fim.item_price * element.quan;
                    });
                    const updateTotalPrice = await Session.findOneAndUpdate(
                        { customer_id: cust_id },
                        { total_price: shoppingTotal } 
                    );
                    if(updateTotalPrice) {
                        res.status(200).send({ msg: "Item quantity in cart & Shopping Session updated successfully", result: response});
                    }
                })
            }
        }
    }
    else{
        const newCartItem = {
            customer_id:cust_id,
            food_item_id:_id,
            selected_quantity:selected_quantity
        };
        const cartItem = new Cart(newCartItem);
        const newCartItemAdded = await cartItem.save();
        if(newCartItemAdded){
            const allCartItemsForCust = await Cart.find({customer_id:cust_id});
            if(allCartItemsForCust){
                let total=0;
                let itemsInCart = allCartItemsForCust.map(async (element) => {
                    return {
                      fim: await Food_List.findById(element.food_item_id),
                      quan: element.selected_quantity,
                    };
                });
                // console.log(itemsInCart);
                Promise.all(itemsInCart).then(async (response)=>{
                    response.forEach((element)=>{
                        total = total + element.fim.item_price * element.quan;
                    });
                    // console.log(total);
                    const shoppingSessionExists = await Session.findOne({customer_id:cust_id});
                    console.log(shoppingSessionExists);
                    if(shoppingSessionExists){
                        console.log(shoppingSessionExists);
                        const updateTotalPrice = await Session.findOneAndUpdate(
                            { customer_id: cust_id },
                            { total_price: total } 
                        );
                        console.log(updateTotalPrice);
                        if(updateTotalPrice) {
                            res.status(200).send({ msg: "Added item to cart & Updated Shopping Session as well", result: response});
                        }
                    }
                    else{
                        const newShoppingSession = { customer_id: cust_id, total_price: total };
                        const sessionDetails = new Session(newShoppingSession);
                        const newSessionAdded = await sessionDetails.save();
                        if (newCartItemAdded && newSessionAdded) {
                            res.status(200).send({ msg: "New food item added to cart successfully", result: response });
                        }
                    }
                });
            }
            else{
                res.status(500).send({msg:"Internal Server Error"});
            }
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
});

// API for Customer to get all items in the cart
router.get("/getcart", async (req, res)=>{
    const {cust_id}=jwt.verify(req.body.token, "mysecretkey");
    const fetchCart = await Cart.find({customer_id:cust_id});
    if(fetchCart){
        let itemsInCart = fetchCart.map(async (element) => {
            return {
              fim: await Food_List.findById(element.food_item_id),
              quan: element.selected_quantity,
            };
        });
        Promise.all(itemsInCart).then((resp) => {
            res.status(200).send({ result: resp });
        });
    }
});

// API for Customer to Checkout
router.post("/checkout", async (req, res)=>{
    const {cust_id}= jwt.verify(req.body.token, "mysecretkey");
    const getTotalPrice = await Session.findOne({customer_id:cust_id});
    if(getTotalPrice && getTotalPrice.total_price){
        const fetchCart = await Cart.find({customer_id:cust_id});
        if(fetchCart){
            let itemsInCart = fetchCart.map(async (element) => {
                return {
                  fim: await Food_List.findById(element.food_item_id),
                  quan: element.selected_quantity,
                };
            });
            Promise.all(itemsInCart).then(async (response) => {
                const newOrderData = { customer_id:cust_id, total_price: getTotalPrice.total_price};
                const order = new Order_details(newOrderData);
                const newOrderAdded = await order.save();
                if(newOrderAdded){
                    const orderSuccess = response.map(async (element)=>{
                        const newOrderedItems = {
                            order_id: newOrderAdded._id,
                            food_item_id: element.fim._id,
                            ordered_item_quantity: element.quan
                        };
                        const orderedItems = new Ordered_items(newOrderedItems);
                        return await orderedItems.save();
                    });
                    Promise.all(orderSuccess).then(async(response)=>{
                        const cleanup = await axios.post("http://localhost:8080/cart/cleanup", 
                        {},
                        {
                            headers: {
                            Authorization: req.body.token,
                            },
                        });
                        if (response && cleanup.status == 200) {
                            res.status(200).send("Order created successfully");
                        }
                    });
                }
            });
        }
    }
});

// API for customer to cleanup the cart 
router.post("/cleanup", async (req, res) => {
    const {cust_id}=jwt.verify(req.headers.authorization, "mysecretkey");
    const cleanup = await Cart.deleteMany({ customer_id:cust_id });
    const deleteSession = await Session.deleteOne({ customer_id:cust_id });
    if (cleanup && deleteSession) {
      res.status(200).send("successfull");
    }
    else{
        res.status(500).send({msg:"Internal Server Error"});
    }
});

module.exports=router;