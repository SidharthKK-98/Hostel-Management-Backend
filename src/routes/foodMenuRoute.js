const express=require("express")
const { userAuth } = require("../middlewares/auth")
const multerMiddleware = require("../middlewares/multer")
const cloudinary=require("../config/cloudinary")
const FoodMenu=require("../models/foodMenu")
const fs=require("fs")
foodMenuRoute=express.Router()


foodMenuRoute.post("/foodMenu/addFoodItem",userAuth,multerMiddleware.single("foodImg"),async(req,res)=>{

    try{

        const {name,price,mealType}=req.body

        if(!req.file){
            return res.status(400).json({message:"Food image is required"})
        }

        const result= await cloudinary.uploader.upload(req.file.path,{
            folder:"foodMenu",
            resource_type:"image"
        })

        const newFoodItem= await FoodMenu.create({

                name,
                price,
                mealType,
                image:result.secure_url,
                publicId:result.public_id
        })


        fs.unlinkSync(req.file.path,(err)=>{
            if(err){
                console.log("Error deleting file",err);
                
            }
        })

        res.status(201).json({message:"food item is saved Successfully",data:newFoodItem})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }

})

foodMenuRoute.delete("/foodMenu/deleteFoodItem/:foodItemId",userAuth,async(req,res)=>{

    try{

        const {foodItemId}= req.params

        const item = await FoodMenu.findById(foodItemId)

        if(!item){
            return res.status(401).json({message:"no food item is found"})
        }

        if(item.publicId){
            await cloudinary.uploader.destroy(item.publicId)
        }

        await FoodMenu.findByIdAndDelete(foodItemId)
        res.status(200).json({message:"food item deleted ",data:item})




    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }

})

foodMenuRoute.patch("/foodMenu/updateFoodItem/:foodItemId",userAuth,multerMiddleware.single("foodImg"),async(req,res)=>{

    try{

        const {foodItemId}= req.params
        const foodItem = await FoodMenu.findById(foodItemId)

        if(!foodItem){
            return res.status(401).json({message:"No foo item found"})
        }

        if(req.file){

            if(foodItem.publicId){
                await cloudinary.uploader.destroy(foodItem.publicId)
            }
            const result= await cloudinary.uploader.upload(req.file.path,{
            folder:"foodMenu",
            resource_type:"image"
        })

                foodItem.image=result.secure_url,
                foodItem.publicId=result.public_id

                fs.unlinkSync(req.file.path);


        }

        Object.keys(req.body).forEach((field)=>{
            foodItem[field] = req.body[field]
        })

        const updatedFoodItem =await foodItem.save()
        res.status(200).json({message:"food item updated successfully",data:updatedFoodItem})


    }
    catch(err){
        res.status(400).json({message:"something is wrong",error:err.message})
    }

})


module.exports=foodMenuRoute