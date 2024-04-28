const express = require("express");
const cors = require('cors');
require("dotenv").config();
const OpenAI = require("openai");
const axios = require('axios');
const { MongoClient } = require('mongodb');

console.log(process.env.MONGODB_URI)
// Connection URI
const uri = process.env.MONGODB_URI;
const dbName = 'textai';
const client = new MongoClient(uri);
async function insertData(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('history');
    await collection.insertOne(data);
  } finally {
    await client.close();
  }
}

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey : process.env.OPEN_AI_KEY,
});

app.post('/complete', async(req,res)=>{

    const userPrompt = req.body.userPrompt;
    const predefinedPrompt = "Complete this text by including this text and adding aditional required text at the end, only add the required text, don't make up words :  ";
    const prompt = predefinedPrompt + userPrompt;
    console.log(prompt);
    const response= await openai.chat.completions.create({
      model : 'gpt-3.5-turbo',
      messages : [{"role":"user", "content" : prompt}],
      max_tokens:25,
    });
    const completedText= userPrompt + response.choices[0].message.content;
    console.log(completedText);
    console.log(process.env.MONGODB_URI);

    insertData({
      inputData: userPrompt,
      selectedButton: 'Complete Text',
      output: completedText,
      timestamp: new Date()
    });

    res.json({ completedText});

    /* Inserting into mongodb */
    

})

app.post('/summarize', async(req,res)=>{

  const userPrompt = req.body.userPrompt;
  const predefinedPrompt = " Summarize this text in short, make it really short within single line :  ";
  const prompt = predefinedPrompt + userPrompt;
  console.log(prompt);
  const response= await openai.chat.completions.create({
    model : 'gpt-3.5-turbo',
    messages : [{"role":"user", "content" : prompt}],
    max_tokens:50,
  });
  const completedText= response.choices[0].message.content;
  console.log(completedText);
  res.json({ completedText });

  /* Inserting into mongodb */
  insertData({
    inputData: userPrompt,
    selectedButton: 'Summarize Text',
    output: completedText,
    timestamp: new Date()
  });
})

app.post('/answer', async(req,res)=>{

  const userPrompt = req.body.userPrompt;
  const predefinedPrompt = " Answer this question with a short answer possible :  ";
  const prompt = predefinedPrompt + userPrompt;
  console.log(prompt);
  const response= await openai.chat.completions.create({
    model : 'gpt-3.5-turbo',
    messages : [{"role":"user", "content" : prompt}],
    max_tokens:20,
  });
  const completedText= response.choices[0].message.content;
  console.log(completedText);
  res.json({ completedText });

  /* Inserting into mongodb */
  insertData({
    inputData: userPrompt,
    selectedButton: 'Answer Text',
    output: completedText,
    timestamp: new Date()
  });
})

app.post('/embedtext', async(req,res)=>{

  const userPrompt = req.body.userPrompt;
  console.log(userPrompt);
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      "input": userPrompt,
      "model": "text-embedding-3-small"
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`
      }
    }
  );
  const embeddata = response.data.data[0].embedding.join();;
  console.log(embeddata);
  res.json({ embeddata });

  /* Inserting into mongodb */
  insertData({
    inputData: userPrompt,
    selectedButton: 'Embed Text',
    output: embeddata,
    timestamp: new Date()
  });
})

const port= process.env.PORT || 4000;

app.listen(port, () => console.log(`Server started on port ${port}`));
module.exports = app;