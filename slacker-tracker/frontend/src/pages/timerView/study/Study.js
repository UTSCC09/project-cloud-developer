import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { TextField, Button, Alert } from '@mui/material'
import CONST from '../../../CONST.js'

function Study () {
  const [missingFieldAlert, setMissingFieldAlert] = useState(false)
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const [studyTimer, setStudyTimer] = useState(null)
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
        if (timer.dutyName === 'Study') setStudyTimer(timer)
      })
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleSetStudyTimer = () => {
    setMissingFieldAlert(false)
    const studyTime = document.getElementById('study-timer-input').value
    if (!studyTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: CONST.backendURL + '/api/timer/allocateTimer',
      data: {
        email,
        dutyName: 'Study',
        orgLength: (studyTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setStudyTimer({ orgLength: (studyTime * 1000 * 60).toString(), dutyName: 'Study', timer: (studyTime * 1000 * 60).toString() })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleResetStudyTimer = () => {
    setMissingFieldAlert(false)
    const studyTime = document.getElementById('study-timer-input').value
    if (!studyTime) return setMissingFieldAlert(true)
    axios({
      method: 'POST',
      url: CONST.backendURL + '/api/timer/modifyTimer',
      data: {
        email,
        dutyName: 'Study',
        newTimeLength: (studyTime * 1000 * 60).toString()
      },
      withCredentials: true
    }).then((res) => {
      setStudyTimer({
        orgLength: (studyTime * 1000 * 60).toString(),
        dutyName: 'Study',
        timer: (parseInt(studyTimer.timer) + (studyTime * 1000 * 60) - parseInt(studyTimer.orgLength)).toString()
      })
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <>
      <h2>Study Timer</h2>
      {missingFieldAlert ? <Alert severity="error">Please fill all the field</Alert> : null}
      {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
      {console.log(studyTimer)}
      {
        studyTimer &&
        <div>
            <h4>
                Your Study Timer has allocated time for <span className='timer-time'>{studyTimer.orgLength / 1000 / 60}</span> minutes
                and <span className='timer-time'>{studyTimer.timer / 1000 / 60}</span> minutes uncompleted
            </h4>
            <TextField
                fullWidth
                id='study-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-study-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleResetStudyTimer}
            >
                Reset Timer
            </Button>
        </div>
      }
      {
        !studyTimer &&
        <div>
            <h4>You have not set the Study timer yet, please enter the allocated time in minutes</h4>
            <TextField
                fullWidth
                id='study-timer-input'
                label="Minutes"
                type="number"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ marginTop: 2, input: { color: 'white' } }}
                color="secondary"
            />
            <Button
                id="set-study-timer-button"
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={handleSetStudyTimer}
            >
                Set Timer
            </Button>
        </div>
      }
    </>
  )
}

export default Study
