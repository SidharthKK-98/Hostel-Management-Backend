
const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({

    message:{
        type:String,
        required:true
    },
    itemId:{
        type:mongoose.Types.ObjectId,
        ref:"Grocery"
    },
    read:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

module.exports = mongoose.model("Notification",notificationSchema)