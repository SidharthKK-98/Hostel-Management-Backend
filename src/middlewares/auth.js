const jwt= require("jsonwebtoken")
const user=require("../models/user")

const userAuth=async(req,res,next)=>{

    try{

        const {token}=req.cookies
        if(!token){
           return res.status(401).json({message:"Unautherized"})
        }
        const decodedValue=jwt.verify(token,process.env.JWT_SECRET)
        
        const {id}=decodedValue
        const AuthenticatedUser= await user.findById(id)

        if(!AuthenticatedUser){
           return res.status(400).json({message:"no user found"})
        }

        req.user=AuthenticatedUser

        next()


    }
    catch(err){
       return res.status(401).json({message:"authentication failed",err})
    }

}

module.exports={userAuth}