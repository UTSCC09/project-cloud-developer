import React, { useState, useEffect } from 'react'
import { Alert, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'
import axios from 'axios'
import PropTypes from 'prop-types'
import Cookies from 'js-cookie'
import CONST from '../../../../CONST.js'

TimerSelect.propTypes = {
  selectedTimerDutyName: PropTypes.any,
  setSelectedTimerDutyName: PropTypes.any,
  timers: PropTypes.any,
  setTimers: PropTypes.any
}

export default function TimerSelect (props) {
  const { selectedTimerDutyName, setSelectedTimerDutyName } = props
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const [timersList, setTimersList] = useState([])
  const [isStarted, setIsStarted] = useState(false)
  const [startedTime, setStartedTime] = useState('')
  const [timeNow, setTimeNow] = useState(Date.now())
  const email = Cookies.get('email')
  const timerHelperList = []
  let elapsedInterval

  useEffect(() => {
    if (!email) return setMissingCookieAlert(true)
    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/timer/self?email=${email}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      let containOrNot
      res.data.data.allocatedTime.forEach(timer => {
        containOrNot = false
        timerHelperList.forEach(ele => {
          if (ele.dutyName === timer.dutyName) containOrNot = true
        })
        if (!containOrNot) timerHelperList.push(timer)
      })
      if (res.data.data.duty.name !== '') {
        setSelectedTimerDutyName(res.data.data.duty.name)
        setIsStarted(true)
        elapsedInterval = setInterval(() => {
          setTimeNow(Date.now())
        }, 1000)
      }
      setStartedTime(new Date(res.data.data.duty.startTime).getTime())
      setTimersList(timerHelperList)
    }).catch((err) => {
      console.log(err)
    })
  }, [isStarted])

  const startTimeElapsed = () => {
    console.log(Date.now())
    elapsedInterval = setInterval(() => {
      setTimeNow(Date.now())
    }, 1000)
  }

  const stopTimeElapsed = () => {
    console.log(Date.now())
    clearInterval(elapsedInterval)
  }

  const handleChangeTimer = (event) => {
    setSelectedTimerDutyName(event.target.value)
  }

  const handleStartTimer = () => {
    startTimeElapsed()
    setIsStarted(true)
    axios({
      method: 'POST',
      url: CONST.backendURL + '/api/timer/startTimer',
      data: {
        email,
        dutyName: selectedTimerDutyName
      },
      withCredentials: true
    }).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleStopTimer = () => {
    setIsStarted(false)
    stopTimeElapsed()
    axios({
      method: 'POST',
      url: CONST.backendURL + '/api/timer/stopTimer',
      data: {
        email,
        dutyName: selectedTimerDutyName,
        stopDate: Date.now().toString()
      },
      withCredentials: true
    }).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <div>
        {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
        <FormControl fullWidth>
            {
                isStarted &&
                <>
                    <h2>{selectedTimerDutyName} Timer</h2>
                    <h4>Time Elapsed: <span className='timer-time'>{ Math.round((timeNow - startedTime) / 1000 / 60) }</span> minutes</h4>
                </>
            }
            {
                !isStarted &&
                <>
                    <InputLabel>Timer</InputLabel>
                    <Select
                        id="selected-timer"
                        value={selectedTimerDutyName}
                        label="Timer"
                        onChange={handleChangeTimer}
                    >
                    {timersList.map(timer => <MenuItem key={timer.dutyName} value={timer.dutyName}>{timer.dutyName}</MenuItem>)}
                    </Select>
                </>
            }
            {
              timersList.map(timer => {
                if (timer.dutyName === selectedTimerDutyName) {
                  return (
                    <div key={timer.dutyName}>
                        <h4>Allocated: <span className='timer-time'>{Math.round(timer.orgLength / 1000 / 60)}</span> minutes</h4>
                        <h4>Uncompleted: <span className='timer-time'>{Math.round(timer.timer / 1000 / 60) - Math.round((timeNow - startedTime) / 1000 / 60)}</span> minutes</h4>
                    </div>
                  )
                } else {
                  return null
                }
              })
            }
            {
                selectedTimerDutyName && !isStarted &&
                <Button
                    id="start-timer-button"
                    variant="contained"
                    sx={{ marginTop: 2 }}
                    onClick={handleStartTimer}
                >
                    Start
                </Button>
            }
            {
                selectedTimerDutyName && isStarted &&
                <Button
                    id="stop-timer-button"
                    variant="contained"
                    color='error'
                    sx={{ marginTop: 2 }}
                    onClick={handleStopTimer}
                >
                    Stop
                </Button>
            }
        </FormControl>
    </div>
  )
}
