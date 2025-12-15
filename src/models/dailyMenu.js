const mongoose=require("mongoose")

const dailyMenuSchema = new mongoose.Schema({

    date:{
        type:Date,
        required:true,
        unique:true
    },
    morning:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"FoodMenu",
            required:true
        }
    ],
    noon:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"FoodMenu",
            required:true
        }
    ],
    night:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"FoodMenu",
            required:true
        }
    ],
    isLocked:{
        type:Boolean,
        default:false 
    },
     expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }   
    }
},{timestamps:true})


module.exports=mongoose.model("DailyMenu",dailyMenuSchema)