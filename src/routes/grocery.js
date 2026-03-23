const express = require("express")
const groceryRoute = express.Router()

const Grocery = require("../models/groceryItems")
const GroceryUsage = require("../models/groceryUsage")
const { userAuth } = require("../middlewares/auth")
const predictStockOutDate = require("../utils/predictStockOutDate")

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

groceryRoute.get("/grocery/getItems",userAuth,async(req,res)=>{

    try{

        const Items = await Grocery.find()
        res.status(200).json({message:"success",data:Items})

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

         const prediction  = await predictStockOutDate(grocery._id)

        await Grocery.findByIdAndUpdate(
                    grocery._id,
                    {        
                            $set:{predictedOutDate:prediction}
                    }         
                 ) 
        res.status(200).json({message:`${name} restored`,data:grocery})

    }
    catch(err){
        res.status(500).json({message:"something went wrong",error:err.message})

    }

})

groceryRoute.post("/grocery/takeGrocery",userAuth,async(req,res)=>{

    try{

        const {groceryId,qty,unit} = req.body
        const grocery = await Grocery.findById(groceryId)

        if(!qty || qty <= 0){
            return res.status(400).json({message:"Invalid quantity"})
        }
        

        if(!grocery){
           return res.status(401).json({message:"Item not found"})
        }

        if(grocery.unit !== unit){
            return res.status(401).json({message:"Unit not matching"})
        }

        if(grocery.currentStock < qty){
           return res.status(401).json({message:"Not enough stock"})
        }

        grocery.currentStock -= qty

        await grocery.save()

       const groceryUsage =  await GroceryUsage.create({
            groceryId,
            quantity:qty,
            unit

        })

        const prediction  = await predictStockOutDate(groceryId)

        await Grocery.findByIdAndUpdate(
                    grocery._id,
                    {        
                            $set:{predictedOutDate:prediction}
                    }         
                 ) 

        res.status(200).json({message:"success",data:grocery})



    }
    catch(err){
        res.status(500).json({message:"something went wrong",error:err.message})

    }

})

groceryRoute.patch("/grocery/update",userAuth,async(req,res)=>{
        try{

            const {_id,name,unit,minStock} = req.body

            if(!_id){
                return res.status(400).json({message:"Grocery ID is required"})
            }

            const updateFields = {}
            if(!name !== undefined) updateFields.name = name
            if (unit !== undefined) updateFields.unit = unit
            if (minStock !== undefined) updateFields.minStock = minStock

            const updatedGrocery = await Grocery.findByIdAndUpdate(

                _id,
                updateFields,
                {new:true,runValidators:true}
            )

             res.status(200).json({
                        message: "Grocery updated successfully",
                        data: updatedGrocery
                    })

        }
        catch(err){
                    res.status(500).json({message:"something went wrong",error:err.message})

        }
})

groceryRoute.delete("/grocery/remove",userAuth,async(req,res)=>{

    try{
            const {_id} = req.body
             if(!_id){
                return res.status(400).json({message:"Grocery ID is required"})
            }

            const deletedItem = await Grocery.findByIdAndDelete(_id)

            res.status(200).json({
            message: "Grocery Removed successfully",
            data: deletedItem
        })
    }
    catch(err){
        res.status(500).json({message:"something went wrong",error:err.message})

    }
})

module.exports = groceryRoute 