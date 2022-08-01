import React, { useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import Nav from '../../components/ui/nav'
import Bubble from '../../components/ui/bubble'
import { Button, Tooltip, Paper } from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import CONST from '../../CONST'
import timeConvert from '../../utils/timeConvert'

function Home () {
  const [timerStarted, setTimerStarted] = React.useState(null)
  const [startTime, setStartTime] = React.useState(null)
  const [timeNow, setTimeNow] = React.useState(null)
  const [onlineUsersId, setOnlineUsersId] = React.useState([])
  const _id = Cookies.get('_id')

  React.useEffect(() => {
    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/timer/self?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      if (res.data.data.duty.name !== 'unallocate' && res.data.data.duty.name !== 'offline') {
        setTimerStarted(res.data.data.duty.name)
        setStartTime(new Date(res.data.data.duty.startTime).getTime())
      }
      refreshBubbles()
    }).catch((err) => {
      console.log(err)
    })
    setTimeNow(new Date().getTime())
    const interval = setInterval(() => setTimeNow(new Date().getTime()), 1000 * 60)
    // setInterval(() => refreshBubbles(), 3000)
    return () => clearInterval(interval)
  }, [])

  const [users, setUsers] = useState(null)
  const [me, setMe] = useState(null)

  const refreshBubbles = () => {
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/timer/self?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      setMe(res.data.data)
    }).catch((err) => {
      console.log(err)
    })
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/timer/friends?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      setUsers(res.data.data)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleStartWorkTimer = () => {
    axios({
      method: 'POST',
      url: `${CONST.backendURL}/api/timer/startTimer`,
      data: {
        _id,
        dutyName: 'work'
      },
      withCredentials: true
    }).then((res) => {
      setTimerStarted('work')
      setStartTime(new Date().getTime())
      refreshBubbles()
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleStartPlayTimer = () => {
    axios({
      method: 'POST',
      url: `${CONST.backendURL}/api/timer/startTimer`,
      data: {
        _id,
        dutyName: 'play'
      },
      withCredentials: true
    }).then((res) => {
      setTimerStarted('play')
      setStartTime(new Date().getTime())
      refreshBubbles()
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleStopTimer = () => {
    axios({
      method: 'POST',
      url: `${CONST.backendURL}/api/timer/stopTimer`,
      data: {
        _id,
        dutyName: timerStarted
      },
      withCredentials: true
    }).then((res) => {
      setTimerStarted(null)
      refreshBubbles()
    }).catch((err) => {
      console.log(err)
    })
  }
  return (
    <div>
      <div className="board">
        <Bubble refreshBubbles={refreshBubbles} me={me} users={users} onlineUsersId={onlineUsersId}></Bubble>
      </div>
      <Nav setOnlineUsersId={setOnlineUsersId}></Nav>
      {
        !timerStarted &&
        <Paper sx={{ position: 'fixed', right: 20, bottom: 20 }}>
          <Tooltip title="Start Work Timer">
            <Button variant="contained" onClick={handleStartWorkTimer}>
              <WorkIcon sx={{ mr: 1 }} />
                Work
            </Button>
          </Tooltip>
          <Tooltip title="Start Play Timer">
            <Button variant="extended" onClick={handleStartPlayTimer}>
              <VideogameAssetIcon sx={{ mr: 1 }} />
                Play
            </Button>
          </Tooltip>
        </Paper>
      }
      {
        timerStarted &&
        <Paper sx={{ position: 'fixed', right: 20, bottom: 20 }}>
          <Button variant="contained" color='error' onClick={handleStopTimer}>
            Stop {timerStarted !== 'play' ? timerStarted : 'play'} Timer({timeConvert.convertMsToHM(timeNow - startTime)})
          </Button>
        </Paper>
      }
    </div>
  )
}

export default Home
