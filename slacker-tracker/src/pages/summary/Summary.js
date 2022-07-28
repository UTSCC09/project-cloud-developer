import React from 'react'
import Cookies from 'js-cookie'
import Nav from '../../components/ui/nav'
import Paper from '@mui/material/Paper'
import { TextField, Button, Alert, Grid } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'
import './Summary.css'

function Summary () {
  const [missingFieldAlert, setMissingFieldAlert] = React.useState(false)
  const [sendSuccess, setSendSuccess] = React.useState(false)
  const [serverError, setServerError] = React.useState(false)
  const _id = Cookies.get('_id')

  const handleSendEmail = () => {
    setMissingFieldAlert(false)
    setSendSuccess(false)
    setServerError(false)

    const sendEmail = document.getElementById('send-email-input').value
    if (!sendEmail) return setMissingFieldAlert(true)

    axios({
      method: 'GET',
      url: `http://localhost:3001/api/generateSummaryEmail?_id=${_id}&sendEmail=${sendEmail}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      setSendSuccess(true)
    }).catch((err) => {
      console.log(err)
      setServerError(true)
    })
  }

  return (
    <div>
        <Nav></Nav>
        <Paper id='summary-container' elevation={3}>
            <h2>Here is your weekly summary!</h2>
            {missingFieldAlert ? <Alert severity="error">Please fill all the field</Alert> : null}
            {sendSuccess ? <Alert severity="success">Request sent successfully</Alert> : null}
            {serverError && <Alert severity="error">Server is not responding, please try again later</Alert>}
            <Grid container spacing={2}>
                <Grid item xs={10}>
                    <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    color="secondary"
                    label="Enter a email"
                    type="email"
                    id='send-email-input'
                    size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button
                    id="send-email-button"
                    variant="contained"
                    sx={{ marginTop: 2 }}
                    onClick={handleSendEmail}
                    endIcon={<SendIcon />}
                    >
                        Send
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    </div>
  )
}

export default Summary
