const express=require("express")
const { userAuth } = require("../middlewares/auth")
const multerMiddleware = require("../middlewares/multer")
const cloudinary=require("../config/cloudinary")
const FoodMenu=require("../models/foodMenu")
const DailyMenu=require("../models/dailyMenu")
const fs=require("fs")
foodMenuRoute=express.Router()


foodMenuRoute.post("/foodMenu/addFoodItem",userAuth,multerMiddleware.single("foodImg"),async(req,res)=>{

    try{

        const {name,price}=req.body
        const foodName= await FoodMenu.findOne({name:{ $regex: new RegExp(`^${name}$`, "i") }})

        if(foodName){
            return res.status(400).json({message:"The Item is already added"})
        }

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

foodMenuRoute.get("/foodMenu/getFoodItems",userAuth,async(req,res)=>{

    try{

        const foodMenu = await FoodMenu.find()
        if(!foodMenu){
            return res.status(409).json({message:"No menu founded"})
        }

        res.status(200).json({message:"success",foodMenu})

    }
    catch(err){
        res.status(400).json({message:"something is wrong",error:err.message})
 
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
            return res.status(401).json({message:"No food item found"})
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


foodMenuRoute.post("/dailyFoodMenu/setFood",userAuth,async(req,res)=>{

    try{

        const {date,morning,noon,night}= req.body
        const requestedDate= new Date(date)
        requestedDate.setHours(0, 0, 0, 0)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if(requestedDate <= today){
            return res.status(400).json({message:"Today's or previous days Menu can't be updated "})
        }

        const existingDate = await DailyMenu.findOne({date:requestedDate})
        if(existingDate){
            return res.status(400).json({message:"Menu for this date is already created"})
        }

        const maxDate= new Date(today)
        maxDate.setDate(maxDate.getDate()+7)

        if(requestedDate > maxDate){
            return res.status(400).json({message:"Menu can only be set for the next 7 days"})
        }



        const menu = new DailyMenu({
            date:requestedDate,
            morning:morning || [],
            noon:noon || [],
            night:night || [] ,
            expiresAt:new Date(requestedDate.getTime()+2*24*60*60*1000)
        
            })

        await menu.save()

        res.status(200).json({message:`Menu added for ${requestedDate}`,data:menu})

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }

})

foodMenuRoute.get("/dailyFoodMenu/getFoodMenu",userAuth,async(req,res)=>{

    try{

        const totalfoodMenu= await DailyMenu.find().populate("morning").populate("noon").populate("night")
        if(!totalfoodMenu){
            return res.status(400).json({message:"no menu is avaliable"})

        }

        res.status(200).json({message:"getting all food Menu",data:totalfoodMenu})

    }
    catch(err){
        res.status(400).json({message:"something is wrong",error:err.message})
    }
})

foodMenuRoute.delete("/dailyFoodMenu/deleteFoodMenu/:FoodMenuId",userAuth,async(req,res)=>{

    try{

        const {FoodMenuId} = req.params
        const menu = await DailyMenu.findById(FoodMenuId)

         if(!menu){
            return res.status(404).json({message:"Daily menu not found"})
        }

        const today= new Date()
        today.setHours(0, 0, 0, 0);

        const menuDate= new Date(menu.date)
        menuDate.setHours(0, 0, 0, 0);

         if(menuDate <= today){
            return res.status(403).json({message:"you can't update menu of today or previous days"})
        }

        await DailyMenu.findByIdAndDelete(FoodMenuId)
        res.status(200).json({message:"food menu deleted ",data:menu})


    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})
    }

})



module.exports=foodMenuRoute