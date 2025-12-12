const mongoose=require("mongoose")

const foodMenuSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    image:{
        type:String,
        required:true,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv1Rx6LphYqv-8nL_9CQEzrypBu8wI5LpypA&s"
    },
    publicId:{
        type:String,
        default:""
    },
    price:{
        type:Number,
        required:true
    }
    

},{timestamps:true})

module.exports=mongoose.model("FoodMenu",foodMenuSchema)