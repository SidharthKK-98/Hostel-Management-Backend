const express = require("express")
const Comment = require("../models/comment")
const { userAuth } = require("../middlewares/auth")
const multerMiddleware = require("../middlewares/multer")
const cloudinary=require("../config/cloudinary")
const fs = require("fs")
const commentRouter = express.Router()

commentRouter.post("/comment/add",userAuth,multerMiddleware.single("commentImg"),async(req,res)=>{

    try{

        const {rating,comment} = req.body

        if(!comment || !rating){
            return res.status(400).json({message:"add required fields"})
        }

              let newComment

        if(req.file){
            const result =  await cloudinary.uploader.upload(req.file.path,{
                folder:"comment",
                resource_type:"image"
            })

             newComment = new Comment({
                user: req.user._id, 
                rating,
                comment,
                image: result.secure_url,
                publicId:result.public_id

            });

                fs.unlink(req.file.path,(err)=>{
                        if(err){
                            console.log("Error deleting file",err);
                            
                        }
                    })

        }
        else{
              newComment = new Comment({
                    user: req.user._id,
                    rating,
                    comment,
                });
        }

        await newComment.save()
        res.status(201).json({message: "Comment added successfully", data: newComment})
    }
    catch(err){
        res.status(500).json({message: "Server error",error:err.message})
        }
})

commentRouter.get("/comment/get",async(req,res)=>{
    try{

        const result = await Comment.find().populate("user" ,"firstName lastName")
        if(!result){
            return res.status(400).json({message:"No comments added yet"})
        }

        res.status(200).json({message:"success",data:result})

    }
    catch(err){
        res.status(500).json({message: "Server error",error:err.message})

    }
})

commentRouter.patch("/comment/edit",userAuth,multerMiddleware.single("commentImg"),async(req,res)=>{
    try{

        const {commentId, rating, comment} = req.body
        if (!commentId) {
        return res.status(400).json({ message: "commentId required" })
      }

      const existingComment = await Comment.findById(commentId)

      if (!existingComment) {
        return res.status(404).json({ message: "Comment not found" })
      }

      if (existingComment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" })
      }

      let updatedData = {}

      if (rating !== undefined) {
        const parsedRating = Number(rating)
      
         if (parsedRating < 1 || parsedRating > 5) {
          return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }
        updatedData.rating = parsedRating

    }
      if (comment) updatedData.comment = comment


      if (req.file) {

                let uploadResult


        try {
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "comment",
            resource_type: "image",
          })
        } catch(err) {
          fs.unlink(req.file.path, () => {}) 
          return res.status(500).json({ message: "Image upload failed" })

        }

        if (existingComment.publicId) {
          await cloudinary.uploader.destroy(existingComment.publicId)
        }

        updatedData.image = uploadResult.secure_url
        updatedData.publicId = uploadResult.public_id
      }

      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        updatedData,
        { new: true }
      )

      res.status(200).json({
        message: "Comment updated successfully",
        data: updatedComment,
      })

    }
    catch(err){
                res.status(500).json({message: "Server error",error:err.message})

    }
})

commentRouter.delete("/comment/remove/:Id",userAuth,async(req,res)=>{

    try{

         const {Id} = req.params

         if(!Id){
            return res.status(400).json({message:"commentId is required"})
         }

         const existingComment = await Comment.findById(Id)

        if (!existingComment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        if (existingComment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const deleteComment = await Comment.findByIdAndDelete(Id)

        if (deleteComment.publicId) {
            try {
                await cloudinary.uploader.destroy(deleteComment.publicId)
            } catch (err) {
                console.log("Image delete failed:", err.message)
            }
            }

        res.status(200).json({message:"comment removed",data:deleteComment})

    }
    catch(err){
        res.status(500).json({message: "Server error",error:err.message})

    }
})

module.exports = commentRouter