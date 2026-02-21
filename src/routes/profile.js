const express=require("express")

const profileRouter=express.Router()
const {userAuth}=require("../middlewares/auth")
const multerMiddleware=require("../middlewares/multer")
const User=require("../models/user")
const cloudinary=require("../config/cloudinary")
const fs=require("fs")


profileRouter.get("/profile/view",userAuth,async(req,res)=>{

    try{

        const profile= await User.findById(req.user._id).populate({path:"roomId",
            populate:{path:"occupants",model:"User",select:"firstName photoUrl age "}}).lean()
            
        if(profile?.roomId?.occupants?.length){
            profile.roomId.occupants =  profile.roomId.occupants.filter(occupant=>occupant._id.toString() !== req.user._id.toString())
        }
        res.status(200).json({message:"profile view",data:profile})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",err})
    }
})


profileRouter.patch("/profile/edit",userAuth,multerMiddleware.single("userImg"),async(req,res)=>{

    try{

        const user=await User.findById(req.user._id)

        if(req.file){
        if(user.photoPublicId){
            await cloudinary.uploader.destroy(user.photoPublicId)
        }

        const result=await cloudinary.uploader.upload(req.file.path,{
            folder:"users",
            resource_type:"image"
        })

        user.photoUrl=result.secure_url
        user.photoPublicId=result.public_id

        // await user.save()

        fs.unlinkSync(req.file.path,(err)=>{
            if(err){
                console.log("Error deleting file",err);
                
            }
        })
    }

         const allowedUpdates = [
        "firstName",
        "lastName",
        
      ]

     const requestFields = Object.keys(req.body)

      const invalidFields = requestFields.filter(
        (field) => !allowedUpdates.includes(field)
      )

      if (invalidFields.length > 0) {
        return res.status(400).json({
          message: `You cannot update: ${invalidFields.join(", ")}`,
        })
      }

       requestFields.forEach((field) => {
        user[field] = req.body[field]
      })

    const updatedUser = await user.save()

        return res.json({ 
            message:"profile picture updated successfully",
            data:updatedUser
        })


    }
    catch(err){
        res.status(400).json({message:"something went wrong",err})
    }

})

profileRouter.get("/profile/getAllUsers",userAuth,async(req,res)=>{
    try{

        const Users = await User.find({
            role:{$ne:"admin"}
        }).select("_id firstName lastName emailId photoUrl isFeesPayed gender age isRoomAllocated").populate({
            path:"roomId",select:"roomNumber"
        })

        res.status(200).json({message:"success",data:Users})

    }
    catch(err){
            res.status(400).json({message:"something went wrong",err})

    }
})
module.exports=profileRouter