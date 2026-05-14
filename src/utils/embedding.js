
const {GoogleGenAI} = require("@google/genai")

const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})

console.log(apikey);

const getEmbedding = async(text)=>{

    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents:text,
        taskType:"SEMANTIC_SIMILARITY"
    })

     if (
        !response.embeddings ||
        !response.embeddings[0]?.values
    ) {
        throw new Error("Embedding generation failed")
    }
    
    return response.embeddings[0].values

}

module.exports = {getEmbedding}