const mongoose=require("mongoose")
const Room=require("./room")

const hostelConfigSchema=new mongoose.Schema({

    totalRooms:{
        type:Number,
        required:true,
        default:0
    },
    roomCapacity:{
        type:Number,
        default:2
    },
    rooms:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Room"
        }
    ]

},{timestamps:true})


// hostelConfigSchema.pre("save",async function(next){

    
    
//     next()

// })

module.exports=mongoose.model("HostelConfig",hostelConfigSchema)