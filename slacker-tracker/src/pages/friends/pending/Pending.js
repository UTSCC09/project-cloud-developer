import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Alert, Paper, Avatar, Grid, Button } from '@mui/material'
import Cookies from 'js-cookie'
import CONST from '../../../CONST.js'

function Pending () {
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const _id = Cookies.get('_id')
  const [senders, setSenders] = useState([])

  useEffect(() => {
    setMissingCookieAlert(false)
    if (!_id) return setMissingCookieAlert(true)

    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/friendList/getRequest?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      setSenders(res.data.data)
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleAccept = senderEmail => {
    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/user?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      console.log(res.data.user.email)
      const receiverEmail = res.data.user.email
      axios({
        method: 'POST',
        url: `${CONST.backendURL}/api/friendList/acceptRequest`,
        data: {
          receiverEmail,
          senderEmail
        },
        withCredentials: true
      }).then((res) => {
        setSenders(senders.filter(sender => {
          return sender.email !== senderEmail
        }))
        console.log(res)
      }).catch((err) => {
        console.log(err)
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleCancel = senderEmail => {
    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/user?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      console.log(res.data.user.email)
      const receiverEmail = res.data.user.email
      axios({
        method: 'POST',
        url: `${CONST.backendURL}/api/friendList/cancelRequest`,
        data: {
          receiverEmail,
          senderEmail
        },
        withCredentials: true
      }).then((res) => {
        console.log(res)
        setSenders(senders.filter(sender => {
          return sender.email !== senderEmail
        }))
      }).catch((err) => {
        console.log(err)
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <>
        <h2>PENDING FRIEND REQUEST</h2>
        {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
        {
            senders.map(sender => {
              return (
                <Paper elevation={3} key={sender._id} sx={{ padding: 2, width: 800, margin: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={1}>
                        <Avatar src={null}/>
                      </Grid>
                      <Grid item xs={7}>
                        <div className="friends-email">{sender.name}</div>
                        <div className="friends-email">{sender.email}</div>
                      </Grid>
                      <Grid item xs={4}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Button variant="contained" onClick={() => handleAccept(sender.email)}>Accept</Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button variant="contained" color='error' onClick={() => handleCancel(sender.email)}>Cancel</Button>
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
