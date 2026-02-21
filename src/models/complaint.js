const mongoose = require("mongoose")


const complaintSchema = new mongoose.Schema({

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    category:{
        type:String,
        enum:["FOOD","ROOM","MAINTENANCE","OTHER"],
        required:true
    },
    subject:{
        type:String,
        trim: true,
         lowercase: true,
         required: true
    },
    status:{
        type:String,
        enum:["OPEN","IN_PROGRESS","RESOLVED"],
        default:"OPEN"
    },
    roomNumber:{
        type:Number,
        required:true
    },
    embedding: {
    type: [Number], 
    required: true,
    select:false
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

complaintSchema.pre("save",function(next){
    if(this.isNew){
        this.timeline.push({
            status:this.status,
            message:`compaint on ${this.category} is created`,
            updatedBy:this.createdBy
        })
    }

    const STATUS_MESSAGES = {
        IN_PROGRESS:`complaint noticed and action has been initiated on ${this.category}`,
        RESOLVED: `Complaint has been resolved successfully on ${this.category}`
    };


    if(this.isModified("status") && !this.isNew){

        const message = STATUS_MESSAGES[this.status] || `status updated to ${this.status}`
        this.timeline.push({
            status:this.status,
            message,
            updatedBy:this.updatedBy
        })
    }

     if (this.status === "RESOLVED") {
      this.embedding = undefined;  
    }
  

    next()

})


module.exports = mongoose.model("Complaint",complaintSchema)