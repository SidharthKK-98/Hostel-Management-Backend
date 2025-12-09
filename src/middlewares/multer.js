const multer=require("multer")
const path=require("path")

const allowedTypes=["image/png","image/jpg","image/jpeg"]

const storage=multer.diskStorage({

    destination:(req,file,callback)=>{
        callback(null,path.join(__dirname,"..",'uploads'))
    },
    filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}-${file.originalname}`)
    }

})

const fileFilter=(req,file,callback)=>{

    if(allowedTypes.includes(file.mimetype)){
        callback(null,true)
    } 
    else{
        callback(new Error("only .png, .jpg, .jpeg formats are allowed"),false)
    }

}

const multerMiddleware=multer({storage,fileFilter})
module.exports=multerMiddleware