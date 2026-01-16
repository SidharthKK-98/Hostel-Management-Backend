const express=require("express")
const cors = require("cors")
require('dotenv').config()
const connectDB=require("./config/connectDB")
const app=express()
const cookie=require("cookie-parser")
const authRoute=require("../src/routes/authRoute")
const profileRoute=require("../src/routes/profile")
const roomRouter = require("./routes/roomRoute")
const foodMenuRoute=require("./routes/foodMenuRoute")
const foodSelectionRoute=require("./routes/foodSelectionRoute")
const complaintRouter = require("./routes/complaintRoute")

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,    
  })
);

app.use(express.json())
app.use(cookie())



app.use("/",authRoute)
app.use("/",profileRoute)
app.use("/",roomRouter)
app.use("/",foodMenuRoute)
app.use("/",foodSelectionRoute)
app.use("/",complaintRouter)


 
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

 
