require('dotenv').config();
const express = require("express");
const cors = require('cors');
const axios = require('axios');
const { Pinecone } = require('@pinecone-database/pinecone');
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});
const index = pc.index("scrape");

var admin = require("firebase-admin");
var serviceAccount = require("./firebaseprivatekey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const firestore = admin.firestore();

const app = express();
app.use(express.json());
app.use(cors());

async function semanticSearch(userInput){
    const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
            "input": userInput,
            "model": "text-embedding-3-small"
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`
            }
        }
    );

    const embeddata = response.data.data[0].embedding;
    const queryResponse = await index.namespace('vector-data').query({
        vector: embeddata,
        topK: 3,
        includeValues: true,
        includeMetadata: true,
    });

    console.log(queryResponse.matches[1].metadata.id);
    const fsId = queryResponse.matches[1].metadata.id;

    const ref = firestore.collection('data').doc(fsId);
    const doc = await ref.get();
    if (!doc.exists) {
        console.log('No such document!');
        return {response : "No document"};
    } else {
        console.log('Document data:', doc.data());
        return doc.data();
    }

}

app.post('/ss', async (req, res) => {
    const userPrompt = req.body.userPrompt;
    const msg = await semanticSearch(userPrompt);
    res.json(msg);
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server started on port ${port}`));
module.exports = app;

