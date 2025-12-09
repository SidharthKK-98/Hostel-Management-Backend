const express=require("express")
const roomRouter=express.Router()
const hostelConfig=require("../models/hostelConfigure")
const { userAuth } = require("../middlewares/auth")
const Room=require("../models/room")
const User=require("../models/user")


roomRouter.post("/hostelConfig/totalRoom/create",userAuth,async(req,res)=>{

    try{

        const {totalRooms,roomCapacity}=req.body

        const newRooms=[]

    for(let i=1;i<=totalRooms;i++){
        const room= await Room.create({
            roomNumber:i,
            capacity:roomCapacity,
        })
        newRooms.push(room._id)
    }
         
        const hostelconfig= new hostelConfig({
            totalRooms,
            roomCapacity,
            rooms:newRooms
        })

        const savedConfig= await hostelconfig.save()
        res.status(200).json({message:"Total Rooms saved",savedConfig})

    }
    catch(err){
        res.status(400).json({message:"error occured",err})
    }
})

roomRouter.get("/hostelConfig/totalroom/get",userAuth,async(req,res)=>{

    try{

        const config=await hostelConfig.findOne().populate({path:"rooms",populate:{path:"occupants",model:User}})
        res.status(200).json({message:"hostel config",config})

    }
    catch(err){
        res.status(400).json({messsage:"error occured",err})
    }

})

roomRouter.post("/hostelConfig/totalRoom/addRooms",userAuth,async(req,res)=>{

    try{

        const {numberOfRooms}=req.body
        const config=await hostelConfig.findOne()

        let newRooms=[]

        for(let i=1;i<=numberOfRooms;i++){

                const roomNumber= config.totalRooms + i


                const room= await Room.create({
                    roomNumber,
                    capacity:config.roomCapacity
                })

                config.rooms.push(room._id)
                newRooms.push(room)

        }

        config.totalRooms+=numberOfRooms

        await config.save()

        res.status(200).json({message:"new room is created",rooms:newRooms})


    }
    catch(err){
        res.status(400).json({message:"something is wrong",error:err.message})
    }

})

roomRouter.delete("/hostelConfig/totalRoom/deleteRoom/:roomId",userAuth,async(req,res)=>{

    try{

        const {roomId}=req.params
        const room = await Room.findById(roomId)

        if(!room){
            return res.status(404).json({message:"No room found"})
        }
        if(room.occupants.length>0){
            return res.status(400).json({message:"Room is not empty"})
        }

        await hostelConfig.updateOne({},{
            $pull:{rooms:room._id},
            $inc:{totalRooms:-1}
        }
        )

        await room.deleteOne()
        res.status(200).json({message:"Room Deleted"})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }
})

roomRouter.post("/room/addGuest/:roomId",userAuth,async(req,res)=>{

    try{

        const {roomId}=req.params
        const {userId}=req.body
        const room= await Room.findById(roomId)
        const user= await User.findById(userId)

        if(!room){
            return res.status(404).json({message:"There is no room found"})
        }
        if(!user){
            return res.status(404).json({message:"No user found"})
        }
        if(room.occupants.length==room.capacity){
            return res.status(400).json({message:"room capacity is exceeded"})
        }
        if(user.isRoomAllocated){
            return res.status(400).json({message:"user already has a room allocated "})
        }
        if (room.occupants.includes(userId)) {
            return res.status(400).json({  message: "User already exists in this room" })
        }

        room.occupants.push(userId)
        await room.save()

        await User.findByIdAndUpdate(userId, {
            isRoomAllocated: true,
            roomId:roomId
        });

        res.status(200).json({message:"room is allocated to user"})

    }
    catch(err){
        res.status(400).json({message:"can't add user",error:err.message})
    }

})

roomRouter.delete("/room/removeGuest/:roomId",userAuth,async(req,res)=>{

    try{

        const {roomId}=req.params
        const {userId}=req.body
        const room= await Room.findById(roomId)
        const user= await User.findById(userId)

        if(!room){
            return res.status(404).json({message:"There is no room found"})
        }
        if(!user){
            return res.status(404).json({message:"No user found"})
        }
        if(room.occupants.length==0){
            return res.status(400).json({message:"This room is empty"})
        }
        if(!room.occupants.includes(userId)){
            return res.status(400).json({message:"this user is already removed or not found in the room"})
        }

        room.occupants=room.occupants.filter(id=>id.toString()!==userId)
       
        await room.save()

        await User.findByIdAndUpdate(userId, {
            isRoomAllocated: false,
            roomId:null
        });

        res.status(200).json({message:"user is removed from the room"})

    }
    catch(err){

        res.status(400).json({message:"something went wrong",error:err.message})
    }

})

module.exports=roomRouter