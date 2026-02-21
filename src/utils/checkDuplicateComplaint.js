
const cosineSimilarity = require("compute-cosine-similarity")
const Complaint = require("../models/complaint")

const checkDuplicateComplaint = async({
    roomNumber,
    category,
    newEmbedding
}) => {

   try{

         const existingComplaints = await Complaint.find({
        roomNumber,
        category,
        status:{$ne:"RESOLVED"}
    }).select("subject +embedding")

    for(const compl of existingComplaints){
        if(!compl.embedding || compl.embedding.length === 0) continue

        const score = cosineSimilarity(newEmbedding,compl.embedding)

        if(score > 0.65){
            return {
                isDuplicate:true,
                matchedComplaint: compl.subject,
                similarityScore: score
            }
        }


    }

    return { isDuplicate: false }


   }
   catch(err){
        console.error("Duplicate check error:", err)
        return { isDuplicate: false }


   }

}

module.exports = { checkDuplicateComplaint }
