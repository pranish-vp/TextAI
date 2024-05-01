import React, { useState } from 'react';
import '../Home.css';
import axios from 'axios';
import Navbar from "./Navbar";

function App() {
  const [inputText, setInputText] = useState('');
  const [completedText, setCompletedText] = useState('');

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleTextCompletion = async () => {
    try {
      const response = await axios.post('http://localhost:4000/complete', { userPrompt: inputText }); //https://backend-textai.vercel.app/complete
      setCompletedText(response.data.lastResponse);
    } catch (error) {
      console.error('Error completing text:', error);
    }
  };




  return (
    <>
      <Navbar  />
      <div className="App">

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
          <button onClick={handleTextCompletion} className='page-buttons' >Generate</button>

        </div>
      </div>
    </>
  );
}

export default App;