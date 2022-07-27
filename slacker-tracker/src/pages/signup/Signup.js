import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Signup.css'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

function Signup () {
  const [missingFieldAlert, setMissingFieldAlert] = useState(false)
  const [passwordMatchAlert, setPasswordMatchAlert] = useState(false)
  const [passwordShortAlert, setPasswordShortAlert] = useState(false)
  const [serverAlert, setServerAlert] = useState(null)
  const navigate = useNavigate()
  const handleSignup = () => {
    setMissingFieldAlert(false)
    setPasswordMatchAlert(false)
    setPasswordShortAlert(false)
    setServerAlert(null)

    const email = document.getElementById('signup-email-input').value
    const name = document.getElementById('signup-name-input').value
    const password = document.getElementById('signup-password-input').value
    const confirmPassword = document.getElementById('signup-confirm-password-input').value

    if (!email || !name || !password || !confirmPassword) return setMissingFieldAlert(true)
    if (password !== confirmPassword) return setPasswordMatchAlert(true)
    if (password.length < 6) return setPasswordShortAlert(true)

    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/user/signup',
      data: {
        name,
        password,
        email
      }
    }).then((res) => {
      navigateToSignin()
    }).catch((err) => {
      setServerAlert(err.response.data.message || 'Please type in a valid email address')
    })
  }

  const navigateToSignin = () => {
    navigate('/signin', { replace: true })
  }

  return (
    <div>
        <Box id="signup-box">
            <h2 className='signup-text signup-title'>Create an account</h2>
            {missingFieldAlert ? <Alert severity="error">Please fill all the fields</Alert> : null}
            {passwordMatchAlert ? <Alert severity="error">Your passwords do not match</Alert> : null}
            {passwordShortAlert ? <Alert severity="error">The length of the password must be greater than 5</Alert> : null}
            {serverAlert ? <Alert severity="error">{ serverAlert }</Alert> : null}
            <TextField fullWidth id="signup-email-input" label="Email" variant="standard" required type='email'/>
            <TextField fullWidth id="signup-name-input" label="Name" variant="standard" required type='text'/>
            <TextField fullWidth id="signup-password-input" label="Password" variant="standard" required type='password'/>
            <TextField fullWidth id="signup-confirm-password-input" label="Confirm Password" variant="standard" required type='password'/>
            <Button id="signup-button" variant="contained" onClick={handleSignup}>Sign Up</Button>
            <div className='signup-text'>
                <a onClick={() => navigateToSignin()}>Already have an account?</a>
            </div>
        </Box>
    </div>
  )
}

export default Signup
