import "../App.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from "./Signin";
import Home from "./Home";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="" element={<Signin/> } />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </Router>
      
    </>
  )
}

export default App;