const express = require("express")
const { userAuth } = require("../middlewares/auth")
const Complaint = require("../models/complaint")
const complaintRouter = express.Router()
const User = require("../models/user")
const Room = require("../models/room")
const {getEmbedding} = require("../utils/embedding")
const {checkDuplicateComplaint} = require("../utils/checkDuplicateComplaint")

complaintRouter.post("/complaint/postIssue",userAuth,async(req,res)=>{

    try{

        const userId = req.user._id
        const {category,subject} = req.body
        const normalizedSubject = subject.trim().toLowerCase()
        const user = await User.findById(userId)
        const room = await Room.findOne({occupants:userId}).select("_id roomNumber")
        const roomNumber = room.roomNumber

        const normalizeComplaintText = (text) => {
                return text
                    .toLowerCase()
                    .replace(/[^\w\s]/g, "")     
                    .replace(/\s+/g, " ")        
                    .trim();
                }
        

        if(!user.isRoomAllocated){
            return res.status(400).json({message:"Room is not yet allocated to you"})
        }

        if (!category || !subject) {
            return res.status(400).json({ message: "Category and subject are required" });
         }

        const categories = ["FOOD","ROOM","MAINTENANCE","OTHER"]
        const cleanSub = normalizeComplaintText(subject)
        const newEmbedding = await getEmbedding(cleanSub)


         if(!categories.includes(category)){
            return res.status(400).json({message:"this is not listed complaint category "})
         }

        const duplicateCheck = await checkDuplicateComplaint({
            roomNumber,
            category,
            newEmbedding
        })
        // console.log("duplicate",duplicateCheck?.isDuplicate);
        

         if(duplicateCheck?.isDuplicate){
            return res.status(400).json({message:"This complaint is already existing and being resolved"})
         }

        const complaint = await Complaint.create({
            createdBy:userId,
            category,
            subject:cleanSub,
            roomNumber,
            embedding: newEmbedding

           
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
        }).populate({path:"createdBy",select:"firstName lastName emailId roomId",populate:{path:"roomId",model:"Room",select:"roomNumber"}}).populate({path:"timeline.updatedBy",model:"User",select:"firstName"})

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

complaintRouter.get("/complaint/getComplaintHistory",userAuth,async(req,res)=>{

    try{

        const userId = req.user._id
        const data = await Complaint.find({
    
                createdBy:userId
            

        }).sort({createdAt:-1}).populate({path:"createdBy",select:"firstName lastName emailId roomId",populate:{path:"roomId",model:"Room",select:"roomNumber"}}).populate({path:"timeline.updatedBy",model:"User",select:"firstName"}) 

        res.status(200).json({message:"complaits got successfully",data:data})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }

})
complaintRouter.patch("/complaint/updateIssue/:issueId",userAuth,async(req,res)=>{

    try{

        const {issueId} = req.params
        const complaint = await Complaint.findById(issueId)
        let newStatus

        if(!complaint){
            return res.status(400).json({message:"No complaint is found"})
        }

        const Status = ["OPEN","IN_PROGRESS","RESOLVED"]

        if(!Status.includes(complaint.status)){
            return res.status(400).json({message:"invalid status"})
        }

        if(complaint.status == "OPEN"){
            newStatus = "IN_PROGRESS"

        }
        else if(complaint.status == "IN_PROGRESS"){
            newStatus = "RESOLVED"
        }
        else{
           return res.status(400).json({message:"This complaint is already resolved"})
        }

        complaint.status = newStatus
        complaint.updatedBy =req.user._id;


        const result = await complaint.save()

        res.status(200).json({message:"complaint updated successfully ",data:result})

    }
     catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }

})

module.exports = complaintRouter