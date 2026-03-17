const Grocery = require("../models/groceryItems")
const GroceryUsage = require("../models/groceryUsage")


const predictStockOutDate = async(groceryId)=>{

    const grocery = await Grocery.findById(groceryId)

    if(!grocery){
        throw new Error("Item not found")
    }

    const usages = await GroceryUsage.find({groceryId}).sort({date:1})

    if(usages.length ===0){
        return null
    }

    //1-2 usage records -> using last quantity

    if(usages.length <= 2){
        const lastUsage = usages[usages.length-1]
        avgDailyUsage = lastUsage.quantity
    }
    else{

        let usageData = usages

        if(usages.length > 7){
            usageData = usages.slice(-7)
        }

        const totalUsed = usageData.reduce((sum,item)=>sum+ item.quantity,0)

        const firstDate = new Date(usages[0].date)
        const lastDate = new Date(usages[usages.length-1].date)

        const days = Math.max(
            Math.ceil(
                (lastDate - firstDate)/(1000*60*60*24)
            ),1
        )

        avgDailyUsage = totalUsed/days
    }

    if(avgDailyUsage === 0) return null
    
    const daysLeft = grocery.currentStock / avgDailyUsage

    const predictedDate = new Date()
    predictedDate.setDate(
        predictedDate.getDate() + Math.ceil(daysLeft)
    )

    grocery.predictedOutDate = predictedDate
    await grocery.save()

    return predictedDate


}

module.exports = predictStockOutDate