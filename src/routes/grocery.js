const express = require("express")
const groceryRoute = express.Router()

const Grocery = require("../models/groceryItems")
const { userAuth } = require("../middlewares/auth")

groceryRoute.post("/grocery/add",userAuth,async(req,res)=>{

    try{

        const {name,unit,addingStock} = req.body

        if(!name || !unit || !addingStock ||addingStock<=0){
            return res.status(400).json({message:"give the required datas"})
        }
        const ItemName = name.toUpperCase()
        const repetedItem = await Grocery.findOne({name:ItemName})

        if(repetedItem){
            return res.status(409).json({message:"Item is already present"})
        }


        const grocery = await Grocery.create({
            name:ItemName,
            unit,
            lastAddedStock:addingStock,
            currentStock:addingStock
        })
        res.status(201).json({message:"Item added successfully",data:grocery})

    }
    catch(err){
        res.status(500).json({message:"something went wrong",error:err.message})

    }

})

groceryRoute.patch("/grocery/restore",userAuth,async(req,res)=>{

    try{

        const {name,unit,restoringAmount} = req.body

        if(!name || !unit || !restoringAmount || restoringAmount<=0){
            return res.status(401).json({message:"upload valid data"})
        }
        const ItemName = name.toUpperCase()

        const item = await Grocery.findOne({name:ItemName})
        if(!item){
            return res.status(400).json({message:"No item is found"})
        }
        

        const updatedStock = item.currentStock + restoringAmount
        const grocery = await Grocery.findOneAndUpdate(
             { name:ItemName },
             { $set:{ currentStock: updatedStock },
                lastAddedStock:restoringAmount
             },
             { new:true }
        )

        res.status(200).json({message:`${name} restored`,data:grocery})

    }
    catch(err){
        res.status(500).json({message:"something went wrong",error:err.message})

    }

})

module.exports = groceryRoute 