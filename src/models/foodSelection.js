const mongoose = require("mongoose")

const foodItemSchema = new mongoose.Schema({

    foodId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"FoodMenu",
        required:true
    },
    portion:{
        type:Number,
        required:true
    }

})

const foodSelectionSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    morning:[
       foodItemSchema
    ],
    noon:[
       foodItemSchema
    ],
    night:[
        foodItemSchema
    ],
    totalPrice:{
        type:Number,
        default:0
    }
},{timestamps:true})

module.exports = mongoose.model("FoodSelection",foodSelectionSchema)