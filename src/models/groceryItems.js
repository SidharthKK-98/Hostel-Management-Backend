const mongoose = require("mongoose")

const groceryItemsSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    unit:{
        type:String,
        enum:["kg","g","liter","ml","packet"],
        required:true
    },
    lastAddedStock:{
        type:Number,
        required:true
    },
    currentStock:{
        type:Number,
        default:0
    },
    minStock:{
        type:Number,
        default:5
    },
    predictedOutDate:{
        type:Date
    }

},{timestamps:true})

module.exports = mongoose.model("Grocery",groceryItemsSchema)