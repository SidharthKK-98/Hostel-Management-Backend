const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        
    },
    amount:{
        type:Number,
        required:true,
        min:1
    },
    currency:{
        type:String,
        default:"INR",
        required:true
    },
    status: {
      type: String,
      required:true
    },
    paymentId:{
        type:String
    },
    orderId:{
        type:String,
        required:true
    }, 
    receipt:{
        type:String,
        required:true
    },
     notes: {
      firstName: String,
      lastName: String,
    },
     month: {
        type: Number,
        required: true
    },
    year: {
        type: Number, 
        required: true
    },
    paidAt:{
        type:Date
    }
},{timestamps:true})

module.exports = mongoose.model("Payment",paymentSchema)