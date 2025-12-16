const mongoose = require("mongoose")


const complaintSchema = new mongoose.Schema({

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        requied:true
    },
    category:{
        type:String,
        enum:["FOOD","ROOM","MAINTENANCE","OTHER"],
        required:true
    },
    subject:{
        type:String
    },
    status:{
        type:String,
        enum:["OPEN","IN_PROGRESS","RESOLVED"],
        default:"OPEN"
    },
    timeline:[
        {
            status:{
                type:String
            },
            message:{
                type:String
            },
            updatedBy:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            updatedAt:{
                type:Date,
                default:Date.now
            }
        }
    ]

},{timestamps:true})


module.exports = mongoose.model("Complaint",complaintSchema)