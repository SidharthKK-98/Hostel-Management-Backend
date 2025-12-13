const express = require("express")
const foodSelectionRoute = express.Router()
const FoodSelection = require("../models/foodSelection")

const User= require("../models/user")
const FoodMenu=require("../models/foodMenu")
const { userAuth } = require("../middlewares/auth")



foodSelectionRoute.post("/foodSelction/selctFood",userAuth,async(req,res)=>{

    try{

        const {userId,date,morning=[],noon=[],night=[]} =req.body

        const selectionDate = new Date(date)
        selectionDate.setHours(0,0,0,0)

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

        res.status(200).json({message:"today's food portion generated successfully",data:summary})

    }
    catch(err){
        res.status(400).json({message:"something goes wrong",error:err.message})
    }

})

module.exports= foodSelectionRoute