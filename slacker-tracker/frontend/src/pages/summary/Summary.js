import React from 'react'
import Cookies from 'js-cookie'
import Nav from '../../components/ui/nav'
import Paper from '@mui/material/Paper'
import { TextField, Button, Alert, Grid } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'
import './Summary.css'
import CONST from '../../CONST.js'

function Summary () {
  const [missingFieldAlert, setMissingFieldAlert] = React.useState(false)
  const [sendSuccess, setSendSuccess] = React.useState(false)
  const [serverError, setServerError] = React.useState(false)
  const [mySummary, setMySummary] = React.useState(null)
  const _id = Cookies.get('_id')

  React.useEffect(() => {
    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/user?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      setMySummary(res.data.user)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleSendEmail = () => {
    setMissingFieldAlert(false)
    setSendSuccess(false)
    setServerError(false)

    const sendEmail = document.getElementById('send-email-input').value
    if (!sendEmail) return setMissingFieldAlert(true)

    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/generateSummaryEmail?_id=${_id}&sendEmail=${sendEmail}`,
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
        <Paper className='summary-container' elevation={3}>
            {
              mySummary &&
              <>
                <h1>Here is your weekly summary!</h1>
                <br/>
                <div>
                  <h2>Your Slacker Score: <span className='summary-number'>{mySummary.slackerScore}</span></h2>
                  <h3>For completed summary, please fill in your email below</h3>
                </div>
              </>
            }
            <br/>
            <h4>You can share your weekly summary with your friends by entering their emails below</h4>
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

        <Paper className='summary-container' elevation={3}>
            <h1>Slacker score description</h1>
            <h3>
              The slacker score is calculated accroding to you timer record of a week. If your total time spent of a specific timer is
              considered as good, you will receive full grade of the evaluation of this timer. If the total time spent is not good but
              within the reasonable limit, you will receive partial grade. Otherwise, you will not receive any grade for this timer.
            </h3>
            <h2>How we calculate your score</h2>
            <h3>
              The slacker score is the sum of four timers. Each score of a timer is the result of the base mutiplied
              by correction and ratio. The ratio represents how your timer fits the good range.
            </h3>
            <br/>
            <h2>How we consider your timer is list as follow:</h2>
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <th>Good Range</th>
                  <th>Limit Range</th>
                  <th>Correction</th>
                </tr>
                <tr>
                  <td>Work</td>
                  <td>30 to 40 hours</td>
                  <td>20 to 50 hours</td>
                  <td>1.35</td>
                </tr>
                <tr>
                  <td>Play</td>
                  <td>5 to 20 hours</td>
                  <td>0 to 30 hours</td>
                  <td>1.1</td>
                </tr>
                <tr>
                  <td>Offline</td>
                  <td>84 to 100 hours</td>
                  <td>56 to 112 hours</td>
                  <td>0.9</td>
                </tr>
                <tr>
                  <td>Not starting a timer</td>
                  <td>0 to 2 hours</td>
                  <td>2 to 8 hours</td>
                  <td>1</td>
                </tr>
              </tbody>
            </table>
        </Paper>
    </div>
  )
}

export default Summary
