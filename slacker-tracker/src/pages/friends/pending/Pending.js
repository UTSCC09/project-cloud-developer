import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Alert, Paper, Avatar, Grid, Button } from '@mui/material'
import Cookies from 'js-cookie'

function Pending () {
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const email = Cookies.get('email')
  const [senderEmails, setSenderEmails] = useState([])

  useEffect(() => {
    setMissingCookieAlert(false)
    if (!email) return setMissingCookieAlert(true)
    console.log(email)

    axios({
      method: 'GET',
      url: `http://localhost:3001/api/friendList/getRequest?email=${email}`,
      withCredentials: true
    }).then((res) => {
      setSenderEmails(res.data.requests.receivedRequests)
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleAccept = senderEmail => {
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/friendList/acceptRequest',
      data: {
        receiverEmail: email,
        senderEmail
      },
      withCredentials: true
    }).then((res) => {
      window.location.href = './friends'
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleCancel = senderEmail => {
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/friendList/cancelRequest',
      data: {
        receiverEmail: email,
        senderEmail
      },
      withCredentials: true
    }).then((res) => {
      console.log(res)
      window.location.href = './friends'
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <>
        <h2>PENDING FRIEND REQUEST</h2>
        {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
        {
            senderEmails.map(senderEmail => {
              return (
                <Paper elevation={3} key={senderEmail} sx={{ padding: 2, width: 800, margin: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={1}>
                        <Avatar src={null}/>
                      </Grid>
                      <Grid item xs={7}>
                        <div className="friends-email">{senderEmail}</div>
                      </Grid>
                      <Grid item xs={4}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Button variant="contained" onClick={() => handleAccept(senderEmail)}>Accept</Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button variant="contained" color='error' onClick={() => handleCancel(senderEmail)}>Cancel</Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                </Paper>
              )
            })
        }
    </>
  )
}

export default Pending
