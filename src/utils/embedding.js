
const {GoogleGenAI} = require("@google/genai")

const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})

const getEmbedding = async(text)=>{

    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents:text,
        taskType:"SEMANTIC_SIMILARITY"
    })

    return response.embeddings[0].values

}

module.exports = {getEmbedding}