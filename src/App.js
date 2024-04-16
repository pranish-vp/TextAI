import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [inputText, setInputText] = useState('');
  const [completedText, setCompletedText] = useState('');

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleTextCompletion = async () => {
    try {
      const response = await axios.post('http://localhost:4000/complete', { userPrompt : inputText });
      setCompletedText(response.data.completedText);
    } catch (error) {
      console.error('Error completing text:', error);
    }
  };

  const handleTextSummarize = async () => {
    try {
      const response = await axios.post('http://localhost:4000/summarize', { userPrompt : inputText });
      setCompletedText(response.data.completedText);
    } catch (error) {
      console.error('Error summarizing text:', error);
    }
  };

  const handleTextAnswer = async () => {
    try {
      const response = await axios.post('http://localhost:4000/answer', { userPrompt : inputText });
      setCompletedText(response.data.completedText);
    } catch (error) {
      console.error('Error answering text:', error);
    }
  };


  return (
    <div className="App">
      <h1>TextAI</h1>
      <textarea
        className='Textarea'
        placeholder="Enter text..."
        value={inputText}
        onChange={handleInputChange}
      />

      <div className='Buttons'>
      <button onClick={handleTextCompletion}>Complete Text</button>
      <button onClick={handleTextSummarize}>Summarize Text</button>
      <button onClick={handleTextAnswer}>Answer Question</button>
      </div>

      <div>
        <h2>Result :</h2>
        <p>{completedText}</p>
      </div>
    </div>
  );
}

export default App;
