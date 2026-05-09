const express = require("express")
const rentRoute = express.Router()
const Rent = require("../models/rentConfig")
const { userAuth } = require("../middlewares/auth")


rentRoute.post("/rent/addRent",userAuth,async(req,res)=>{

    try{

        const {rent} = req.body
        const existing = await Rent.findOne()

            if (existing) {
                return res.status(400).json({
                    message: "Rent already exists. Use update instead."
                })
            }

                const newRent = await Rent.create({ rent })

                  return res.status(201).json({
                        message: "Rent Added successfully",
                        data: newRent
                        })

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }

})

rentRoute.get("/rent/getRent",userAuth,async(req,res)=>{
    try{

         const rent = await Rent.findOne();

            return res.status(200).json({
            message: "Rent fetched successfully",
            data: rent
            })

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }
})

rentRoute.patch("/rent/updateRent",userAuth,async(req,res)=>{

    try{

        const {rent} = req.body
         const updated = await Rent.findOneAndUpdate(
            {}, 
            { rent },
            { new: true }
        )

         if (!updated) {
            return res.status(404).json({
                message: "No rent is added."
            })
        }

         return res.status(200).json({
            message: "Rent updated successfully",
            data: updated
        })


    }
     catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }

})

module.exports = rentRoute