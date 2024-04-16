const express = require("express");
const cors = require('cors');
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey : process.env.OPEN_AI_KEY,
});

app.post('/complete', async(req,res)=>{

    const userPrompt = req.body.userPrompt;
    const predefinedPrompt = " Complete this text by including this text and adding aditional required text at the end, only add the required text, don't make up words :  ";
    const prompt = predefinedPrompt + userPrompt;
    console.log(prompt);
    const response= await openai.chat.completions.create({
      model : 'gpt-3.5-turbo',
      messages : [{"role":"user", "content" : prompt}],
      max_tokens:25,
    });
    const completedText= userPrompt + response.choices[0].message.content;
    console.log(completedText);
    res.json({ completedText });
})

app.post('/summarize', async(req,res)=>{

  const userPrompt = req.body.userPrompt;
  const predefinedPrompt = " Summarize this text in short, make it really short and include all points :  ";
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
})

const port= process.env.PORT || 4000;

app.listen(port, () => console.log(`Server started on port ${port}`));