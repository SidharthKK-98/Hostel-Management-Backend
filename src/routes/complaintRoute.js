const express = require("express")
const { userAuth } = require("../middlewares/auth")
const Complaint = require("../models/complaint")
const complaintRouter = express.Router()
const User = require("../models/user")

complaintRouter.post("/complaint/postIssue",userAuth,async(req,res)=>{

    try{

        const userId = req.user._id
        const {category,subject} = req.body

        const user = await User.findById(userId)

        if(!user.isRoomAllocated){
            return res.status(400).json({message:"Room is not yet allocated to you"})
        }

        if (!category || !subject) {
            return res.status(400).json({ message: "Category and subject are required" });
         }
        const categories = ["FOOD","ROOM","MAINTENANCE","OTHER"]

         if(!categories.includes(category)){
            return res.status(400).json({message:"this is not listed complaint category "})
         }

        const complaint = await Complaint.create({
            createdBy:userId,
            category,
            subject
           
        })

        res.status(201).json({message:"complaint is successfully posted",data:complaint})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }

})

complaintRouter.get("/complaint/getAllUnresolved",userAuth,async(req,res)=>{

    try{

        const data = await Complaint.find({
            status:{$ne:"RESOLVED"}
        }).populate({path:"createdBy",select:"firstName lastName emailId roomId",populate:{path:"roomId",model:"Room",select:"roomNumber"}})

        res.status(200).json({message:"complaits got successfully",data:data})
    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }
})

complaintRouter.get("/complaint/getUnresolved",userAuth,async(req,res)=>{

    try{

        const userId = req.user._id
        const data = await Complaint.find({
            $and:[
                {createdBy:userId},
               {status:{$ne:"RESOLVED"}}
            ]
        }) 

        res.status(200).json({message:"complaits got successfully",data:data})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }

})

module.exports = complaintRouter