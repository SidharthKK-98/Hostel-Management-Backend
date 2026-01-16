const mongoose=require("mongoose")
const validator=require("validator")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const Room=require("./room")


const userSchema=new mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address")
            }
        }
    },
    password:{
        type:String,
        required:true,
        minLength:6,
        select:false
    },
    role:{
        type:String,
        required:true,
        default:"user",
        enum:{
            values:["admin","user"],
            message:"{value} is not valid"
        }
    },
    photoUrl:{
        type:String,
        default:"https://static.vecteezy.com/system/resources/previews/003/715/527/non_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-vector.jpg"

    },
    photoPublicId:{
        type:String,
        default:""
    },
    isFeesPayed:{
        type:Boolean,
        default:false
    },
    gender:{
        type:String,
        enum:{
            values:["male","female","others"],
            message: "{VALUE} is not a valid gender"

        }
    },
    age:{
        type:Number,
        min:18
    },
     roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        default: null
    },
    isRoomAllocated:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

userSchema.methods.getJWT=function(){
    const user=this
    const token= jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1hr"})
    return token
}

userSchema.methods.validatePassword= async function(inputPassword){
    const user=this
    const hashedPassword=user.password
    const isValidPassword= await bcrypt.compare(inputPassword,hashedPassword)
    return isValidPassword
}


module.exports=mongoose.model("User",userSchema)