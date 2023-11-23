const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cloudinary = require("../helper/CloudinaryConfig");
const multer = require("multer");
const axios = require("axios");
const Food_List = require("../Schema/FoodSchema");

const imgConfig = multer.diskStorage({});
const imgFilter = (req, file, callback) => {
  if (
    file.mimetype.split("/")[1] === "jpeg" ||
    file.mimetype.split("/")[1] === "jpg" ||
    file.mimetype.split("/")[1] === "png"
  ) {
    callback(null, true);
  } 
  else{
    callback(new multer.MulterError(-1), false);
  }
};
const upload =multer({
    storage: imgConfig,
    fileFilter: imgFilter,
}).single("item_picture_url");

const uploadImage=(req,res,next)=>{
    try{
        upload(req,res,(err)=>{
            if(err){
                if(err.code===-1){
                    console.log("Invalid file type! Please upload .png, jpg, jpeg files");
                    res.status(422).send({msg: "Invalid file type! Please upload .png, jpg, jpeg format images only"});
                }
            }
            else{
                console.log("file uploaded successfully"); 
                console.log(req.file);
                next();
            }
        }) 
    }
    catch(e){
        console.log(e)
    }
}

// API for Restaurant to Add food item
router.post("/add_food_item", uploadImage, async (req, res)=>{
    try{
        console.log(req.body);
        const { item_name, item_quantity, item_price, item_description } = req.body;
        const uploadToCloud = await cloudinary.uploader.upload(req.file.path);
        if(uploadToCloud){
            const { secure_url } = uploadToCloud;
            console.log(secure_url);
            const decodedRToken=jwt.verify(req.headers.authorization, "mysecretkey");
            const {_id} = decodedRToken;
            const newFoodItem = {
                restaurant_id:_id,
                item_name:item_name,
                item_quantity:item_quantity,
                item_price:item_price,
                item_description:item_description,
                item_picture_url:secure_url,
            };
            const foodItemExists = await Food_List.findOne({restaurant_id:_id, item_name:item_name});
            if(foodItemExists){
                console.log(foodItemExists);
                res.status(200).send({msg:"Food item with same name already exists in your Menu", token:"food-item-already-exits"});
            }
            else{
                const foodItem = new Food_List(newFoodItem);
                const newFoodItemAdded = await foodItem.save();
                console.log(newFoodItemAdded);
                if(newFoodItemAdded){
                    res.status(200).send({msg:"New food item added successfully", foodItem:newFoodItem});
                }
                else{
                    res.status(500).send({msg:"Internal Server Error"});
                }
            }
        }
    }
    catch(e){
        console.log(e);
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
            item_description:item_description
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

// API for Restaurant to Change the Availability/Stock of food.
router.put("/change_food_stock", async (req, res)=>{
    const {_id, item_stock} = req.body;
    const stockUpdated = await Food_List.findOneAndUpdate({_id:_id}, {item_stock:item_stock});
    console.log(stockUpdated );
    if(stockUpdated){
        res.status(200).send({msg:"Stock of this food item updated successfully"});
    }
    else{
        res.status(500).send({msg:"Internal Server Error"});
    }
});

// API to get full food items list
router.get("/get_full_food_itemslist", async (req, res)=>{
    const fullFoodList = await Food_List.find({});
    if(fullFoodList){
        res.status(200).send(fullFoodList);
    }
    else{
        res.status(500).send({msg:"Internal Server Error"});
    }
});

module.exports=router;