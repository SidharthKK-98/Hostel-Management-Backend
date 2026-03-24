const express = require("express")
const paymentRoutes = express.Router()
const RazorpayInstance = require("../utils/razorpay")
const Payment = require("../models/payment")
const User=require("../models/user")

const { userAuth } = require("../middlewares/auth")
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils")


paymentRoutes.post("/payment/create",userAuth,async(req,res)=>{

    try{

        const {amount,month,year} = req.body
        const {firstName,lastName} = req.user

        const order = await RazorpayInstance.orders.create({

            amount:amount*100,
            currency:"INR",
            receipt:`rent_for_${month}_${year}_${firstName}`,
            notes:{
                firstName,
                lastName,
                month,
                year
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
            notes:order.notes,
            month,
            year
        }) 

        const savePayment = await payment.save()

        res.json({key:process.env.RAZORPAY_ID,...savePayment.toJSON()})
        

    }
    catch(err){
        res.status(400).json({message:"something went wrong",error:err.message})

    }
})

paymentRoutes.post("/payment/webhook",async(req,res)=>{
    try{

              const webhookSignature = req.headers["x-razorpay-signature"];

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!isWebhookValid) {
            console.log("webhook is not valid");
            return res.status(400).json({ message: "webhook is not valid" });
        }

        const event = req.body.event;

        if (event !== "payment.captured") {
            return res.status(200).json({ message: "event ignored" });
        }

        const paymentDetails = JSON.parse(req.body).payload.payment.entity;

        console.log(paymentDetails);

        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id,
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        payment.status = paymentDetails.status;
        await payment.save();

        const user = await User.findById(payment.userId);

        if (user && paymentDetails.status === "captured") {
            user.isFeesPayed = true;
            await user.save();
        }

        return res.status(200).json({ msg: "webhook received" });
        

    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "webhook error" });

    }
})

module.exports = paymentRoutes