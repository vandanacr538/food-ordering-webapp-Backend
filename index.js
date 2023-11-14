const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL;
const api = require("./api");
app.use(express.json());

app.listen(PORT, (err)=>{
    if(err){
        console.log(err);
    }
    console.log("Server started successfully at " + PORT);
});

mongoose.connect(dbUrl).then(()=>{
    console.log("connected to db");
})
.catch((error)=>{
    console.log("some error occurred");
});

app.use("/", api);

