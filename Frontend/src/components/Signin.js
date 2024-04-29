import React, {useEffect, useState} from 'react';
import '../Signin.css';
import textaiIcon from '../images/textai.png';
import {auth,provider} from '../config';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'


function Signin() {
    const navigate = useNavigate();
    const [value,setValue] = useState('');
    const handleClick = () => {
        signInWithPopup(auth,provider).then((data) =>{
            setValue(data.user.email)
            localStorage.setItem("email",data.user.email)
        }
    )
    }
    useEffect(()=>{
        setValue(localStorage.getItem("email"))
    }, []);
    
    return (
        <>
        <div className='container'>
            <div className='logo'>
                <img src={textaiIcon} alt="Icon" class="icon" />
                <h1 className='title'>TextAI</h1>
            </div>
            <div className='text-container'>
                <h2 className='center-text welcome-text'>Welcome to our website!</h2>
                <div className='login-container'>
                    <h3 className='center-text'>Log In</h3>
                    <div className='center-btn'>
                        {
                        value? navigate("/Home") :
                        <button className='login-button' onClick={handleClick}>Sign in with Google</button>
    }
                    </div>
                </div>
            </div>
        </div>
        
        </>
    );
}

export default Signin