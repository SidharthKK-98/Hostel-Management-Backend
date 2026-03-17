const mongoose = require("mongoose")

const groceryUsageSchema = new mongoose.Schema({

    groceryId:{
        type:mongoose.Types.ObjectId,
        ref:"Grocery",
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    unit:{
        type:String,
        required:true
    },
    usedBy:{
        type:String,
        default:"cook"
    },
    date:{
        type:Date,
        default:Date.now
    }

},{timestamps:true})

module.exports =  mongoose.model("GroceryUsage",groceryUsageSchema)