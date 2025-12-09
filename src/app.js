const express=require("express")
require('dotenv').config()
const connectDB=require("./config/connectDB")
const app=express()
const cookie=require("cookie-parser")
const authRoute=require("../src/routes/authRoute")
const profileRoute=require("../src/routes/profile")
const roomRouter = require("./routes/roomRoute")

app.use(express.json())
app.use(cookie())



app.use("/",authRoute)
app.use("/",profileRoute)
app.use("/",roomRouter)



 
connectDB().then(
    ()=>{
        console.log("database connected");

        app.listen(3000,()=>{
        console.log("server connected successfully at 3000");
    })
 }
)
.catch((err)=>{
    console.log(err+"err"); 
    
})

 
