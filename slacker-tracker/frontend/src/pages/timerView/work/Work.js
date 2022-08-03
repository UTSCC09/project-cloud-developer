import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { TextField, Button, Alert } from '@mui/material'

function Work () {
  const [missingFieldAlert, setMissingFieldAlert] = useState(false)
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const [workTimer, setWorkTimer] = useState(null)
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
        if (timer.dutyName === 'Work') setWorkTimer(timer)
      })
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleSetWorkTimer = () => {
    setMissingFieldAlert(false)
    const workTime = document.getElementById('work-timer-input').value
    if (!workTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/timer/allocateTimer',
      data: {
        email,
        dutyName: 'Work',
        orgLength: (workTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setWorkTimer({ orgLength: (workTime * 1000 * 60).toString(), dutyName: 'Work', timer: (workTime * 1000 * 60).toString() })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleResetWorkTimer = () => {
    setMissingFieldAlert(false)
    const workTime = document.getElementById('work-timer-input').value
    if (!workTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/timer/modifyTimer',
      data: {
        email,
        dutyName: 'Work',
        newTimeLength: (workTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setWorkTimer({
        orgLength: (workTime * 1000 * 60).toString(),
        dutyName: 'Work',
        timer: (parseInt(workTimer.timer) + (workTime * 1000 * 60) - parseInt(workTimer.orgLength)).toString()
      })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <>
      <h2>Work Timer</h2>
      {missingFieldAlert ? <Alert severity="error">Please fill all the field</Alert> : null}
      {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
      {
        workTimer &&
        <div>
            <h4>
                Your Work Timer has allocated time for <span className='timer-time'>{workTimer.orgLength / 1000 / 60}</span> minutes
                and <span className='timer-time'>{workTimer.timer / 1000 / 60}</span> minutes uncompleted
            </h4>
            <TextField
                fullWidth
                id='work-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-work-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleResetWorkTimer}
            >
                Reset Timer
            </Button>
        </div>
      }
      {
        !workTimer &&
        <div>
            <h4>You have not set the work timer yet, please enter the allocated time in minutes</h4>
            <TextField
                fullWidth
                id='work-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-work-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleSetWorkTimer}
            >
                Set Timer
            </Button>
        </div>
      }
    </>
  )
}

export default Work
