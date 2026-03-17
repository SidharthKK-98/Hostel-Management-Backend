
const cron = require("node-cron")
const Grocery = require("../models/groceryItems")
const Notification = require("../models/notification")

cron.schedule("0 * * * * ",async()=>{

    try{

        const lowStockItems = await Grocery.find({
            $expr: {$lte:["$currentStock","$minStock"]}
        })

        for(const item of lowStockItems){
            const message = `${item.name} stock is low ${item.currentStock} ${item.unit}`
            
            const existingNotification = await Notification.findOne({
                itemId:item._id,
                read:false
            })

            if(!existingNotification){

                const notification = await Notification.create({
                    message,
                    itemId:item._id
                })

                

            }
        }

    }
    catch(err){
        console.log("cron error",err.message);
        
    }

})