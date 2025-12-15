const express = require("express")
const foodSelectionRoute = express.Router()
const FoodSelection = require("../models/foodSelection")

const User= require("../models/user")
const FoodMenu=require("../models/foodMenu")
const { userAuth } = require("../middlewares/auth")
const { default: mongoose } = require("mongoose")
const moment = require("moment-timezone")


foodSelectionRoute.post("/foodSelction/selctFood",userAuth,async(req,res)=>{

    try{

        const {date,morning=[],noon=[],night=[]} =req.body
        const userId = req.user._id
        const selectionDate = new Date(date)
        selectionDate.setHours(0,0,0,0)

        const today = new Date()
        today.setHours(0,0,0,0)

        if(selectionDate <= today){
            return res.status(400).json({message:"you can't select today's or previous day foods"})
        }

        const alreadySelected = await FoodSelection.findOne({
                 userId,
                 date:selectionDate
            
        })
        if(alreadySelected){
            return res.status(400).json({message:`you already selected  food for ${selectionDate} `})
        }

        const validateItems=(items)=>
            items.map((item)=>{
                if(!item.foodId || !item.portion){
                    throw new Error("foodId and portion are required")
                }
                return item
            })

             const morningData = validateItems(morning)
             const noonData = validateItems(noon)
             const nightData = validateItems(night)

             const allSelectedItems=[...morningData,...noonData,...nightData]
             console.log(allSelectedItems);
             

             const selectedFoodIds= allSelectedItems.map((i)=>i.foodId)

             const selectedFoods = await FoodMenu.find({_id:{$in:selectedFoodIds}})
             console.log(selectedFoods);
             

             let totalPrice = 0 

             allSelectedItems.forEach((item)=>{

                const food = selectedFoods.find((f)=> f._id.toString()===item.foodId)

                if(food){

                    totalPrice+=food.price*item.portion 
                }
             })

             const newSelection = await FoodSelection.create({
                userId,
                date:selectionDate,
                morning:morningData,
                noon:noonData,
                night:nightData,
                totalPrice
             })

             res.status(200).json({message:"Food Selected ",data:newSelection})
 
    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }

})



foodSelectionRoute.get("/foodSelction/getByDate",userAuth,async(req,res)=>{

    try{


        const {date}= req.query


        if(!date){
            return res.status(400).json({message:"date is required"})
        }

        const start = new Date(date)
        start.setHours(0,0,0,0)

        const end = new Date(date)
        end.setHours(23,59,59,999)
        console.log(start,end);
        

        const summary = await FoodSelection.aggregate([
           
            {$match: {
                date:{
                    $gte:start,
                    $lte:end
                }
            }},
            {
                $project:{
                    allItems:{
                        $concatArrays:["$morning","$noon","$night"]
                    }
                }
            },
            {$unwind:"$allItems"},
            {
                $group:{
                    _id:"$allItems.foodId",
                    totalPortion:{$sum: "$allItems.portion"}
                }
            },
            {
                $lookup:{
                    from:"foodmenus",
                    localField:"_id",
                    foreignField:"_id",
                    as:"food"
                }
            },
            {$unwind:"$food"},
            {
                $project:{
                    foodId:"$food._id",
                    name:"$food.name",
                    price:"$food.price",
                    totalPortion:1
                }
            }

        ])

        res.status(200).json({message:`${date} selected foods and thier  portions are`,data:summary})

    }
    catch(err){
        res.status(400).json({message:"something goes wrong",error:err.message})
    }

})

foodSelectionRoute.get("/foodSelction/getByUserId",userAuth,async(req,res)=>{

    try{

        const {year,month} = req.body
        const userId = req.user._id

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({message:"No user found"})
        }

       
        const startDate = new Date(year,month-1,1)
        const endDate = new Date(year,month,1)
        console.log(startDate,endDate);
        

        const result = await FoodSelection.aggregate([
            {
                $match:{
                    userId:new mongoose.Types.ObjectId(userId),
                    date:{
                        $gte:startDate,
                        $lt:endDate
                    }
                }
            },
            {
                $group:{
                    _id:null,
                    totalPrice:{$sum:"$totalPrice"}
                }

            }
        ])

        const monthlyTotal = result[0]?.totalPrice || 0

        res.status(200).json({message:"result get succefully",data:monthlyTotal})


    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }
})

module.exports= foodSelectionRoute