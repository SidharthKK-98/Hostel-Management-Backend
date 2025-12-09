const mongoose=require("mongoose")
const User=require("./user")
const roomSchema= new mongoose.Schema({

    roomNumber:{
        type:Number,
        require:true,
        unique:true 
    },
    gender:{
        type:String,
        enum:["male","female","other"],
    },
    capacity:{
        type:Number,
        default:2
    },
    occupants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    status:{
        type:String,
        enum:["empty","partially_occupied","full"],
        default:"empty"
    }

},{timestamps:true})


roomSchema.pre("validate", function (next) {
    if (this.occupants.length > this.capacity) {
        return next(new Error("Room capacity exceeded!"));
    }
    next();
});

roomSchema.pre("save",async function(next){
    if(this.occupants.length==0){
        this.status="empty"
    }
    else if(this.occupants.length<this.capacity){
        this.status="partially_occupied"
    }
    else{
        this.status="full"

    }
    next()
})


module.exports=mongoose.model("Room",roomSchema)