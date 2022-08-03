import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Signup.css'
import { TextField, Button, Box, Alert } from '@mui/material'
import CONST from '../../CONST.js'

function Signup () {
  const [alertInfo, setAlertInfo] = React.useState(null)
  const [successInfo, setSuccessInfo] = React.useState(null)
  const navigate = useNavigate()

  const handleSignup = () => {
    setAlertInfo(null)

    const email = document.getElementById('signup-email-input').value
    const name = document.getElementById('signup-name-input').value
    const password = document.getElementById('signup-password-input').value
    const confirmPassword = document.getElementById('signup-confirm-password-input').value

    if (!email || !name || !password || !confirmPassword) return setAlertInfo('Please fill all the fields！')
    if (password !== confirmPassword) return setAlertInfo('Your passwords do not match！')
    if (password.length < 6) return setAlertInfo('The length of the password must be greater than 5！')

    axios({
      method: 'POST',
      url: `${CONST.backendURL}/api/user/signup`,
      data: {
        name,
        password,
        email
      }
    }).then((res) => {
      console.log(res)
      setSuccessInfo(`${res.data.message}! You will be redirected to sign in page in 3 seconds`)
      setTimeout(() => {
        navigateToSignin()
      }, 3000)
    }).catch((err) => {
      setAlertInfo((err.response.data && err.response.data.message) || 'Please type in a valid email address')
    })
  }

  const navigateToSignin = () => {
    navigate('/signin', { replace: true })
  }

  return (
    <div>
        <Box id="signup-box">
            <h2 className='signup-text signup-title'>Create an account</h2>
            {alertInfo && <Alert severity="error">{alertInfo}</Alert>}
            {successInfo && <Alert severity="success">{successInfo}</Alert>}
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
