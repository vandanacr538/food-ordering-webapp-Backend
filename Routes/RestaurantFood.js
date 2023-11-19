const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Food_List = require("../Schema/FoodSchema");


// API for Restaurant to Add food item
router.post("/add_food_item", async (req, res)=>{
    const {item_name, item_quantity, item_price, item_description, item_stock} = req.body;
    const {r_id}=jwt.verify(req.body.token, "mysecretkey");
    const newFoodItem = {
        restaurant_id:r_id,
        item_name:item_name,
        item_quantity:item_quantity,
        item_price:item_price,
        item_description:item_description,
        item_stock:item_stock
    };
    const foodItemExists = await Food_List.findOne({restaurant_id:r_id, item_name:item_name});
    if(foodItemExists){
        console.log(foodItemExists);
        res.status(200).send({msg:"Food item with same name already exists in your Menu", token:"food-item-already-exits"});
    }
    else{
        const foodItem = new Food_List(newFoodItem);
        const newFoodItemAdded = await foodItem.save();
        console.log(newFoodItemAdded);
        if(newFoodItemAdded){
            res.status(200).send({msg:"New Food Item Added successfully", foodItem:newFoodItem});
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
});

// API for Restaurant to Update food item
router.put("/update_food_item", async (req, res)=>{
    const {_id, restaurant_id, item_name, item_quantity, item_price, item_description, item_stock} = req.body;
    const sameFoodNameExists = await Food_List.findOne({restaurant_id:restaurant_id, item_name:item_name});
    if(sameFoodNameExists){
        res.status(200).send({msg:"Food Item with same name already exists in your menu", token:"food-item-already-exits"});
    }
    else{
        const updateFoodItem = await Food_List.findOneAndUpdate({_id:_id}, {
            item_name:item_name,
            item_quantity:item_quantity,
            item_price:item_price,
            item_description:item_description,
            item_stock:item_stock
        });
        if(updateFoodItem){
            res.status(200).send({msg:"New Food Item Added successfully", updatedFoodItem:updateFoodItem});      
        }
        else{
            res.status(500).send({msg:"Internal Server Error"});
        }
    }
});

// API for Restaurant to Delete food item
router.delete("/delete_food_item", async (req, res)=>{
    const {_id, restaurant_id, item_name} = req.body;
    const foodItemDeleted = await Food_List.deleteOne({_id:_id, restaurant_id:restaurant_id}); 
    console.log(foodItemDeleted);
    if(foodItemDeleted.deletedCount){
        res.status(200).send({msg: item_name+" deleted from your menu"})
    }
    else{
        res.status(500).send({msg:"Internal Server Error"});
    }
});

module.exports=router;