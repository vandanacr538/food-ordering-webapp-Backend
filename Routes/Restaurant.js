const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Restaurants = require("../Schema/RestaurantSchema");

// API for Restaurant Sign Up
router.post("/signup", async (req, res) => {
  const {
    restaurant_name,
    restaurant_email,
    restaurant_address,
    restaurant_openingtime,
    restaurant_closingtime,
    restaurant_password,
  } = req.body;
  const newRestaurantData ={
    restaurant_name:restaurant_name,
    restaurant_email:restaurant_email,
    restaurant_address:restaurant_address,
    restaurant_openingtime:restaurant_openingtime,
    restaurant_closingtime:restaurant_closingtime,
    restaurant_password:restaurant_password,
  }
  const restaurantExist = await Restaurants.findOne({restaurant_email:restaurant_email});
  if(restaurantExist){
    console.log(restaurantExist);
    res.status(200).send({msg:"A restaurant already exists with the email provided, Please try to login", token:"restaurant-already-exists"});
  }
  else{
    const restaurant = new Restaurants(newRestaurantData);
    const newRestaurantAdded = await restaurant.save();
    if(newRestaurantAdded){
        console.log(newRestaurantAdded);
        const jwtToken = jwt.sign(newRestaurantAdded.toJSON(), "mysecretkey");
        res.status(200).send({msg:"New Restaurant Added successfully"});
    }
    else{
        res.status(500).send({msg:"Internal Server Error"});
    }
  }
});

// API for Restaurant Login
router.post("/login", async (req, res)=>{
    const {restaurant_email, restaurant_password} = req.body;
    const restaurantExist = await Restaurants.findOne({restaurant_email:restaurant_email});
    if(restaurantExist){
        if(restaurantExist.restaurant_password===restaurant_password){
            const resturantData = {r_id:restaurantExist._id}
            const jwtToken = jwt.sign(resturantData, "mysecretkey");
            res.status(200).send({msg:"Restaurant Login Successful", token:jwtToken});
        }
        else{
            res.status(403).send({msg:"Entered email or password is incorrect"});
        }
    }
    else{
        res.status(401).send({msg:"Restaurant is not registered with this email address, please SignUp to register"})
    }
});

module.exports=router;
