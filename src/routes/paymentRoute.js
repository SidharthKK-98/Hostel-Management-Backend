const express = require("express")
const paymentRoutes = express.Router()
const RazorpayInstance = require("../utils/razorpay")
const Payment = require("../models/payment")
const { userAuth } = require("../middlewares/auth")


paymentRoutes.post("/payment/create",userAuth,async(req,res)=>{

    try{

        const {amount} = req.body
        const {firstName,lastName} = req.user

        const order = await RazorpayInstance.orders.create({

            amount:amount*100,
            currency:"INR",
            receipt:`rent_for_${firstName}`,
            notes:{
                firstName,
                lastName
            }

        })
        console.log(order)

        const payment = new Payment({

            userId:req.user._id,
            orderId:order.id,
            status:order.status,
            amount:order.amount,
            currency:order.currency,
            receipt:order.receipt,
            notes:order.notes
        })

        const savePayment = await payment.save()

        res.json({key:process.env.RAZORPAY_ID,...savePayment.toJSON()})
        

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }
})

module.exports = paymentRoutes