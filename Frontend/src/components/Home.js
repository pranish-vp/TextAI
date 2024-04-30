import React, { useState } from 'react';
import '../Home.css';
import axios from 'axios';
import textaiIcon from '../images/textai.png';
import { useNavigate } from 'react-router-dom';

function App() {

  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [completedText, setCompletedText] = useState('');

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleTextCompletion = async () => {
    try {
      const response = await axios.post('https://backend-textai.vercel.app/complete', { userPrompt : inputText });
      setCompletedText(response.data.completedText);
    } catch (error) {
      console.error('Error completing text:', error);
    }
  };

  const handleTextSummarize = async () => {
    try {
      const response = await axios.post('https://backend-textai.vercel.app/summarize', { userPrompt : inputText });
      setCompletedText(response.data.completedText);
    } catch (error) {
      console.error('Error summarizing text:', error);
    }
  };

  const handleTextAnswer = async () => {
    try {
      const response = await axios.post('https://backend-textai.vercel.app/answer', { userPrompt : inputText });
      setCompletedText(response.data.completedText);
    } catch (error) {
      console.error('Error answering text:', error);
    }
  };

  const textEmbedding = async () => {
    try {
      const response = await axios.post('https://backend-textai.vercel.app/embedtext', { userPrompt : inputText });
      setCompletedText(response.data.embeddata);
    } catch (error) {
      console.error('Error answering text:', error);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="App">

      <div className="Containericon">
        <img src={textaiIcon} alt="Icon" className="icon" />
        <h1 className='Title'>TextAI</h1>
      </div>


      <div className='Content'>

        <div className='InputSection'>
          <h2 className='Label'>Input</h2>
          <textarea
            className='Textarea'
            placeholder="Enter text..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        <div className='ResultSection'>
          <h2 className='Label'>Output</h2>
          <textarea
            className='Textarea2'

            value={completedText}
            onChange={() => { }}
          />
        </div>

      </div>


      <div className='Buttons'>
        <button onClick={handleTextCompletion}>Complete Text</button>
        <button onClick={handleTextSummarize}>Summarize Text</button>
        <button onClick={handleTextAnswer}>Answer Question</button>
        <button onClick={textEmbedding}>Embed Text</button>
      </div>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default App;
