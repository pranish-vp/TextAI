import React from 'react';
import textaiIcon from '../images/textai.png';
import '../Nav.css';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

function Navbar() {

    const {logOut, user } = UserAuth();
    const navigate = useNavigate();
    const handleSignout = async () => {
        try {
          await logOut();
        }
        catch(error) {
          console.log(error);
        }
      }
    
        return (
            <div>
                <div className='nav-container'>
                    <div className='nav-logo'>
                        <img src={textaiIcon} alt="nav-icon" className="nav-icon" />
                        <h1 className='nav-title'>TextAI</h1>
                    </div>
                    <div className='nav-list-container'>
                        <ul className='nav-list'>
                            <li>{user?.displayName ? <p>{user?.displayName}</p> : <p>User</p> }</li>
                            <li><button className='login-button' onClick={handleSignout}>Logout</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        );
}


export default Navbar;