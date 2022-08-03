import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { TextField, Button, Alert } from '@mui/material'
import CONST from '../../../CONST.js'

function Entertainment () {
  const [missingFieldAlert, setMissingFieldAlert] = useState(false)
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const [entertainmentTimer, setEntertainmentTimer] = useState(null)
  const email = Cookies.get('email')

  useEffect(() => {
    if (!email) return setMissingCookieAlert(true)
    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/timer/self?email=${email}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      res.data.data.allocatedTime.forEach(timer => {
        if (timer.dutyName === 'Entertainment') setEntertainmentTimer(timer)
      })
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleSetEntertainmentTimer = () => {
    setMissingFieldAlert(false)
    const entertainmentTime = document.getElementById('entertainment-timer-input').value
    if (!entertainmentTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: CONST.backendURL + '/api/timer/allocateTimer',
      data: {
        email,
        dutyName: 'Entertainment',
        orgLength: (entertainmentTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setEntertainmentTimer({ orgLength: (entertainmentTime * 1000 * 60).toString(), dutyName: 'Entertainment', timer: (entertainmentTime * 1000 * 60).toString() })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleResetEntertainmentTimer = () => {
    setMissingFieldAlert(false)
    const entertainmentTime = document.getElementById('entertainment-timer-input').value
    if (!entertainmentTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: CONST.backendURL + '/api/timer/modifyTimer',
      data: {
        email,
        dutyName: 'Entertainment',
        newTimeLength: (entertainmentTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setEntertainmentTimer({
        orgLength: (entertainmentTime * 1000 * 60).toString(),
        dutyName: 'Entertainment',
        timer: (parseInt(entertainmentTimer.timer) + (entertainmentTime * 1000 * 60) - parseInt(entertainmentTimer.orgLength)).toString()
      })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <>
      <h2>Entertainment Timer</h2>
      {missingFieldAlert ? <Alert severity="error">Please fill all the field</Alert> : null}
      {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
      {
        entertainmentTimer &&
        <div>
            <h4>
                Your Entertainment Timer has allocated time for <span className='timer-time'>{entertainmentTimer.orgLength / 1000 / 60}</span> minutes
                and <span className='timer-time'>{entertainmentTimer.timer / 1000 / 60}</span> minutes uncompleted
            </h4>
            <TextField
                fullWidth
                id='entertainment-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-entertainment-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleResetEntertainmentTimer}
            >
                Reset Timer
            </Button>
        </div>
      }
      {
        !entertainmentTimer &&
        <div>
            <h4>You have not set the entertainment timer yet, please enter the allocated time in minutes</h4>
            <TextField
                fullWidth
                id='entertainment-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-entertainment-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleSetEntertainmentTimer}
            >
                Set Timer
            </Button>
        </div>
      }
    </>
  )
}

export default Entertainment
