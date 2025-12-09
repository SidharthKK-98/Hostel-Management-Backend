
const isAdmin=(req,res,next)=>{

    const {role}=req.user
    if(!role){
        return res.status(403).json({message:"no role is defined"})
    }
    if(role!="admin"){
        return res.status(403).json({message:"Access is limited to admin"})
    }

    next()

}

module.exports=isAdmin