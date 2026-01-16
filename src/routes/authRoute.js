const express=require("express")
const authRoute=express.Router()
const User=require("../models/user")
const bcrypt=require("bcrypt")
const validator=require("validator")



authRoute.post("/signup",async(req,res)=>{


    try{

        const {firstName,lastName,emailId,password,role,photoUrl,isFeesPayed,gender,age,isRoomAllocated}=req.body
        const isExistingUser=await User.findOne({emailId})

        if(isExistingUser){
            return res.status(409).json({message:"user is already existing"})
        }

        const encryptedPassword=await bcrypt.hash(password,10)

        const user=new User({
            firstName,
            lastName,
            emailId,
            password:encryptedPassword,
            role,
            photoUrl,
            isFeesPayed,
            gender,
            age,
            isRoomAllocated

        })

        const savedUser=await user.save()

        const token=savedUser.getJWT()

        res.cookie("token",token,{
            httpOnly:true,
            sameSite:"none",
            secure:true 
        })

         const userObj = savedUser.toObject()
         delete userObj.password

        res.status(200).json({
            message:"signup successfull",
            user:userObj
        })

    }
    catch(err){
        res.status(400).json({message:"something went wrong"})
        console.log("something went wrong ",err);
        
    }

})


authRoute.post("/login",async(req,res)=>{

    try{

        const {emailId,password}=req.body
        const user=await User.findOne({emailId}).select("+password")

        if(!user){
           return res.status(401).json({message:"no user found"})
        }
        const validPassword=await user.validatePassword(password)

        if(!validPassword){
           return res.status(400).json({message:"invalid credentials"})
        }

        const token=user.getJWT()
        res.cookie("token",token,{
            httpOnly:false,
            sameSite:"lax",
            secure:false
        })

        const userObj = user.toObject()
        delete userObj.password

        res.status(200).json({message:"login is successfull",user:userObj})


    }
    catch(err){
        res.status(400).json({message:"something went wrong",err:err.message})
    }
})


authRoute.post("/logout",(req,res)=>{

    res.clearCookie("token",{
        httpOnly:true,
        sameSite:"none",
        secure:true
    })

    res.status(200).json({message:"logged out successfully"})

})







module.exports=authRoute
