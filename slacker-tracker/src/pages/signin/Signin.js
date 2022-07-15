import React, { useState } from 'react'
import axios from 'axios'
import './Signin.css'
import LoginButton from '../../components/google_oauth2/login'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

function Signin () {
  const [missingFieldAlert, setMissingFieldAlert] = useState(false)
  const [serverAlert, setServerAlert] = useState(null)
  const handleSignin = () => {
    setMissingFieldAlert(false)
    setServerAlert(null)

    const email = document.getElementById('signin-email-input').value
    const password = document.getElementById('signin-password-input').value

    if (!email || !password) return setMissingFieldAlert(true)

    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/user/signin',
      data: {
        password,
        email
      },
      withCredentials: true
    }).then((res) => {
      console.log(res)
      document.cookie = `email=${res.data.user.email}`
      window.location.href = './home'
    }).catch((err) => {
      console.log(err)
      setServerAlert(err.response.data.message)
    })
  }
  return (
    <div>
        <Box id="signin-box">
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <h2 className='signin-text signin-title'>Welcome Back</h2>
                    <h4 className='signin-text'>We are so excited to see you again!</h4>
                    {missingFieldAlert ? <Alert severity="error">Please fill all the fields</Alert> : null}
                    {serverAlert ? <Alert severity="error">{ serverAlert }</Alert> : null}
                    <TextField fullWidth id="signin-email-input" label="Email" variant="standard" type='email'/>
                    <br/>
                    <TextField fullWidth id="signin-password-input" label="Password" variant="standard" type='password'/>
                    <br/>
                    <Button id="signin-button" variant="contained" onClick={handleSignin}>Sign In</Button>
                    <div className='signin-text'>
                        Need an account? <a href='/signup'>Register</a>
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
