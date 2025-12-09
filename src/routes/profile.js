const express=require("express")

const profileRouter=express.Router()
const {userAuth}=require("../middlewares/auth")
const multerMiddleware=require("../middlewares/multer")
const User=require("../models/user")
const cloudinary=require("../config/cloudinary")
const fs=require("fs")


profileRouter.get("/profile/view",userAuth,async(req,res)=>{

    try{

        const profile=  req.user
        res.status(200).json({message:"profile view",data:profile})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",err})
    }
})


profileRouter.patch("/profile/edit/image",userAuth,multerMiddleware.single("userImg"),async(req,res)=>{

    try{

        const user=await User.findById(req.user._id)

        if(user.photoPublicId){
            await cloudinary.uploader.destroy(user.photoPublicId)
        }

        const result=await cloudinary.uploader.upload(req.file.path,{
            folder:"users",
            resource_type:"image"
        })

        user.photoUrl=result.secure_url
        user.photoPublicId=result.public_id

        await user.save()

        fs.unlinkSync(req.file.path,(err)=>{
            if(err){
                console.log("Error deleting file",err);
                
            }
        })

        return res.json({
            message:"profile picture updated successfully",
            user
        })


    }
    catch(err){
        res.status(400).json({message:"something went wrong",err})
    }

})

module.exports=profileRouter