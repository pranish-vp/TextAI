import "../App.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from "./Signin";
import Home from "./Home";
import { AuthContextProvider } from "../context/AuthContext";
import Protected from "./Protected";
import Navbar from "./Navbar";

function App() {
  return (
    <>
    <AuthContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Signin/> } />
          <Route path="/Home" element={<Protected> <Home /> </Protected>} />
          <Route path="/Nav" element={ <Navbar /> } />
        </Routes>
      </Router>
      </AuthContextProvider>
    </>
  )
}

export default App;