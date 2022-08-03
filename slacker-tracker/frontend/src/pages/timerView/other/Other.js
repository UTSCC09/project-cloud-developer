import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { TextField, Button, Alert } from '@mui/material'

function Other () {
  const [missingFieldAlert, setMissingFieldAlert] = useState(false)
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const [otherTimer, setOtherTimer] = useState(null)
  const email = Cookies.get('email')

  useEffect(() => {
    if (!email) return setMissingCookieAlert(true)
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/timer/self?email=${email}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      res.data.data.allocatedTime.forEach(timer => {
        if (timer.dutyName === 'Other') setOtherTimer(timer)
      })
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleSetOtherTimer = () => {
    setMissingFieldAlert(false)
    const otherTime = document.getElementById('other-timer-input').value
    if (!otherTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/timer/allocateTimer',
      data: {
        email,
        dutyName: 'Other',
        orgLength: (otherTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setOtherTimer({ orgLength: (otherTime * 1000 * 60).toString(), dutyName: 'Other', timer: (otherTime * 1000 * 60).toString() })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleResetOtherTimer = () => {
    setMissingFieldAlert(false)
    const otherTime = document.getElementById('other-timer-input').value
    if (!otherTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/timer/modifyTimer',
      data: {
        email,
        dutyName: 'Other',
        newTimeLength: (otherTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setOtherTimer({
        orgLength: (otherTime * 1000 * 60).toString(),
        dutyName: 'Other',
        timer: (parseInt(otherTimer.timer) + (otherTime * 1000 * 60) - parseInt(otherTimer.orgLength)).toString()
      })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <>
      <h2>Other Timer</h2>
      {missingFieldAlert ? <Alert severity="error">Please fill all the field</Alert> : null}
      {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
      {
        otherTimer &&
        <div>
            <h4>
                Your Other Timer has allocated time for <span className='timer-time'>{otherTimer.orgLength / 1000 / 60}</span> minutes
                and <span className='timer-time'>{otherTimer.timer / 1000 / 60}</span> minutes uncompleted
            </h4>
            <TextField
                fullWidth
                id='other-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-other-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleResetOtherTimer}
            >
                Reset Timer
            </Button>
        </div>
      }
      {
        !otherTimer &&
        <div>
            <h4>You have not set the other timer yet, please enter the allocated time in minutes</h4>
            <TextField
                fullWidth
                id='other-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-other-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleSetOtherTimer}
            >
                Set Timer
            </Button>
        </div>
      }
    </>
  )
}

export default Other
