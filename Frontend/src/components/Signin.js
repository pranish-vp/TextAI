import React from 'react';
import '../Signin.css';
import textaiIcon from '../images/textai.png';


function Signin() {
    /* useEffect(()=>{
        setValue(localStorage.getItem("email"))
    }, []); */
    
    return (
        <>
        <div className='container'>
            <div className='logo'>
                <img src={textaiIcon} alt="Icon" className="icon" />
                <h1 className='title'>TextAI</h1>
            </div>
            <div className='text-container'>
                <h2 className='center-text welcome-text'>Welcome to our website!</h2>
                <div className='login-container'>
                    <h3 className='center-text'>Log In</h3>
                    <div className='center-btn'>
                        <button className='login-button'>Sign in with Google</button>
                    </div>
                </div>
            </div>
        </div>
        
        </>
    );
}

export default Signin