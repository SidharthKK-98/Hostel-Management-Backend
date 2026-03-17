
const cron = require("node-cron")
const Grocery = require("../models/groceryItems")
const predictStockOutDate = require("../utils/predictStockOutDate")

cron.schedule("0 * * * * ",async()=>{
    try{

        const groceries = await Grocery.find()
        for(const item of groceries){
          const prediction =   await predictStockOutDate(item._id)
          await Grocery.findByIdAndUpdate(
            item._id,
            {        
                    $set:{predictedDate:prediction}
            }         
         )
        }
        console.log("Prediction updated");
        
    }
    catch(err){
        console.log("cron error",err.message);
    }
})