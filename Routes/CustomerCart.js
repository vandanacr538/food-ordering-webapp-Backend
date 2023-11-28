const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { Cart, Session } = require("../Schema/CartSchema");
const Food_List = require("../Schema/FoodSchema");
const { Order_details, Ordered_items } = require("../Schema/OrderSchema");


// API for Customer to add to cart.
router.post("/add_to_cart", async (req, res)=>{
    try{
        const {item, quantity} = req.body;
        const decodedCToken=jwt.verify(req.headers.authorization, "mysecretkey");
        const {_id, restaurant_id} = item;
        const itemExistsInCart = await Cart.findOne({customer_id:decodedCToken._id, food_item_id:_id});
        console.log(_id, item._id);

        if(itemExistsInCart){
            const updateItemQuantity = await Cart.findOneAndUpdate(
                { food_item_id:_id, customer_id: decodedCToken._id },
                { $set: { quantity: itemExistsInCart.quantity + Number(quantity) } }
            );
            console.log(updateItemQuantity);
            if(updateItemQuantity){
                const getAllCartItemsForCust = await Cart.find({customer_id:decodedCToken._id});
                console.log(getAllCartItemsForCust);
                if(getAllCartItemsForCust){
                    let itemsInCart = getAllCartItemsForCust.map(async (element) => {
                        return {
                        fim: await Food_List.findById(element.food_item_id),
                        quan: element.quantity,
                        };
                    });
                    Promise.all(itemsInCart).then(async (response)=>{
                        let totalPrice=0;
                        response.forEach((element)=>{
                            totalPrice=totalPrice+element.fim.item_price * element.quan;
                            console.log(totalPrice);
                        });
                        console.log(decodedCToken._id)
                        const updateTotalPrice = await Session.findOneAndUpdate(
                            { customer_id: decodedCToken._id },
                            { total_price: totalPrice } 
                        );
                        console.log(updateTotalPrice);
                        if(updateTotalPrice) {
                            res.status(200).send({ msg: "Item quantity in cart & Shopping Session updated successfully", result: response});
                        }
                    })
                }
            }
        }
        else{
            const newCartItem = {
                customer_id:decodedCToken._id,
                food_item_id:_id,
                quantity:quantity
            };
            const cartItem = new Cart(newCartItem);
            const newCartItemAdded = await cartItem.save();
            if(newCartItemAdded){
                console.log(newCartItemAdded);
                const allCartItemsForCust = await Cart.find({customer_id:decodedCToken._id});
                if(allCartItemsForCust){
                    let total=0;
                    let itemsInCart = allCartItemsForCust.map(async (element) => {
                        return {
                        fim: await Food_List.findById(element.food_item_id),
                        quan: element.quantity,
                        };
                    });
                    // console.log(itemsInCart);
                    Promise.all(itemsInCart).then(async (response)=>{
                        response.forEach((element)=>{
                            total = total + element.fim.item_price * element.quan;
                        });
                        // console.log(total);
                        const shoppingSessionExists = await Session.findOne({customer_id:decodedCToken._id});
                        console.log(shoppingSessionExists);
                        if(shoppingSessionExists){
                            console.log(shoppingSessionExists);
                            const updateTotalPrice = await Session.findOneAndUpdate(
                                { customer_id: decodedCToken._id },
                                { $set: { total_price: total } } 
                            );
                            console.log(updateTotalPrice);
                            if(updateTotalPrice) {
                                res.status(200).send({ msg: "Added item to cart & Updated Shopping Session as well", result: response});
                            }
                        }
                        else{
                            const newShoppingSession = { customer_id: decodedCToken._id, total_price: total };
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
    }
    catch(e){
        console.log(e);
    }
});

// API for Customer to get all items in the cart
router.post("/getcart", async (req, res)=>{
    try{
        const {_id}=jwt.verify(req.headers.authorization, "mysecretkey");
        const fetchCart = await Cart.find({customer_id:_id});
        if(fetchCart){
            let itemsInCart = fetchCart.map(async (element) => {
                return {
                fim: await Food_List.findById(element.food_item_id),
                quan: element.quantity,
                };
            });
            Promise.all(itemsInCart).then((resp) => {
                res.status(200).send({ result: resp });
            });
        }
    }
    catch(e){
        console.log(e);
    }
});

// API to get total price of cart items
router.post("/get_totalprice", async (req, res)=>{
    try{
        const {_id}=jwt.verify(req.headers.authorization, "mysecretkey");
        const totalPrice = await Session.find({customer_id:_id});
        if(totalPrice){
            console.log(totalPrice);
            res.status(200).send(totalPrice);
        }
    }
    catch(e){
        console.log(e);
    }
});

// API for Customer to update the quantity of item present in cart
router.put("/update_item_quantity", async (req, res)=>{
    try{
        const {fim, quan} = req.body;
        const {_id}  = fim;
        const decodedCToken=jwt.verify(req.headers.authorization, "mysecretkey");
        console.log(decodedCToken);
        const updateItemQuantity = await Cart.findOneAndUpdate(
            { food_item_id:_id, customer_id: decodedCToken._id},{quantity:quan}
        );    
        if(updateItemQuantity){
            const allCartItemsForCust = await Cart.find({customer_id:decodedCToken._id});
            if(allCartItemsForCust){
                let total=0;
                let itemsInCart = allCartItemsForCust.map(async (element) => {
                    return {
                    fim: await Food_List.findById(element.food_item_id),
                    quan: element.quantity,
                    };
                });
                Promise.all(itemsInCart).then(async (response)=>{
                    response.forEach((element)=>{
                        total = total + element.fim.item_price * element.quan;
                    });
                    const updateTotalPrice = await Session.findOneAndUpdate(
                        { customer_id: decodedCToken._id },
                        { $set: { total_price: total } }
                    );
                    console.log(updateTotalPrice);
                    if(updateTotalPrice) {
                        res.status(200).send({ msg: "Added item to cart & Updated Shopping Session as well", result: response});
                    }
                });
            }
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
    catch(e){
        console.log(e);
    }
})

// API for Customer to remove item from the Cart
router.delete("/remove_item_from_cart", async (req, res)=>{
    try{
        const {fim, quan} = req.body.itemToRemoveFromCart;
        const {_id} = fim;
        const decodedCToken=jwt.verify(req.headers.authorization, "mysecretkey");
        const removeItemFromCart = await Cart.deleteOne({ food_item_id:_id, customer_id: decodedCToken._id}); 
        if(removeItemFromCart.deletedCount){
            console.log("remove");
            const allCartItemsForCust = await Cart.find({customer_id:decodedCToken._id});
            if(allCartItemsForCust){
                let total=0;
                let itemsInCart = allCartItemsForCust.map(async (element) => {
                    return {
                    fim: await Food_List.findById(element.food_item_id),
                    quan: element.quantity,
                    };
                });
                Promise.all(itemsInCart).then(async (response)=>{
                    response.forEach((element)=>{
                        total = total + element.fim.item_price * element.quan;
                    });
                    console.log(total);
                    const updateTotalPrice = await Session.findOneAndUpdate(
                        { customer_id: decodedCToken._id },
                        { $set: { total_price: total } }
                    );
                    console.log(updateTotalPrice);
                    if(updateTotalPrice) {
                        res.status(200).send({ msg: "Item Removed from your menu", result: response});
                    }
                });
            }
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
    catch(e){
        console.log(e);
    }
});

// API for Customer to Checkout
router.post("/checkout", async (req, res)=>{
    try{
        const decodedCToken= jwt.verify(req.headers.authorization, "mysecretkey");
        console.log(decodedCToken)
        const getTotalPrice = await Session.findOne({customer_id:decodedCToken._id});
        if(getTotalPrice && getTotalPrice.total_price){
            const fetchCart = await Cart.find({customer_id:decodedCToken._id});
            if(fetchCart){
                let itemsInCart = fetchCart.map(async (element) => {
                    return {
                    fim: await Food_List.findById(element.food_item_id),
                    quan: element.quantity,
                    };
                });
                Promise.all(itemsInCart).then(async (response) => {
                    const newOrderData = { customer_id:decodedCToken._id, total_price: getTotalPrice.total_price};
                    const order = new Order_details(newOrderData);
                    const newOrderAdded = await order.save();
                    if(newOrderAdded){
                        const orderSuccess = response.map(async (element)=>{
                            const newOrderedItems = {
                                order_id: newOrderAdded._id,
                                food_item_id: element.fim._id,
                                item_restaurant_id: element.fim.restaurant_id,
                                item_name: element.fim.item_name,
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
                                Authorization: req.headers.authorization,
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
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
    catch(e){
        console.log(e);
    }
});

// API for customer to cleanup the cart 
router.post("/cleanup", async (req, res) => {
    try{
        const decodedCToken=jwt.verify(req.headers.authorization, "mysecretkey");
        const cleanup = await Cart.deleteMany({ customer_id:decodedCToken._id });
        const deleteSession = await Session.deleteOne({ customer_id:decodedCToken._id });
        if (cleanup && deleteSession) {
        res.status(200).send("successfull");
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
    catch(e){
        console.log(e);
    }
});

module.exports=router;