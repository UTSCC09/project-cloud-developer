import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Signin.css'
import LoginButton from '../../components/google_oauth2/login'
import { TextField, Button, Grid, Box, Alert } from '@mui/material'
import CONST from '../../CONST.js'

function Signin () {
  const [alertInfo, setAlertInfo] = React.useState(null)
  const navigate = useNavigate()
  const handleSignin = () => {
    setAlertInfo(null)

    const email = document.getElementById('signin-email-input').value
    const password = document.getElementById('signin-password-input').value

    if (!email || !password) return setAlertInfo('Please fill all the fields')

    axios({
      method: 'POST',
      url: `${CONST.backendURL}/api/user/signin`,
      data: {
        password,
        email
      },
      withCredentials: true
    }).then((res) => {
      navigateToHome()
    }).catch((err) => {
      setAlertInfo((err.response.data && err.response.data.message) || 'Please type in a valid email address')
    })
  }

  const navigateToHome = () => {
    navigate('/home', { replace: true })
  }

  const navigateToSignup = () => {
    navigate('/signup', { replace: true })
  }

  return (
    <div>
        <Box id="signin-box">
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <h2 className='signin-text signin-title'>Welcome Back</h2>
                    <h4 className='signin-text'>We are so excited to see you again!</h4>
                    {alertInfo && <Alert severity="error">{ alertInfo }</Alert>}
                    <TextField fullWidth id="signin-email-input" label="Email" variant="standard" type='email'/>
                    <br/>
                    <TextField fullWidth id="signin-password-input" label="Password" variant="standard" type='password'/>
                    <br/>
                    <Button id="signin-button" variant="contained" onClick={handleSignin}>Sign In</Button>
                    <div className='signin-text'>
                        Need an account? <a onClick={() => navigateToSignup()}>Register</a>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <h4 className='signin-text signin-title'>Log in with Third Party</h4>
                    <LoginButton/>
                </Grid>
            </Grid>
        </Box>
    </div>
  )
}

export default Signin
