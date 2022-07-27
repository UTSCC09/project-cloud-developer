import React from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import Nav from '../../components/ui/nav'
import Bubble from '../../components/ui/bubble'
import { Button, Tooltip, Paper } from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'

function Home () {
  const [timerStarted, setTimerStarted] = React.useState(null)
  const _id = Cookies.get('_id')

  const handleStartWorkTimer = () => {
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/timer/startTimer',
      data: {
        _id,
        dutyName: 'work'
      },
      withCredentials: true
    }).then((res) => {
      setTimerStarted('work')
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleStartGameTimer = () => {
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/timer/startTimer',
      data: {
        _id,
        dutyName: 'play'
      },
      withCredentials: true
    }).then((res) => {
      setTimerStarted('play')
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleStopTimer = () => {
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/timer/stopTimer',
      data: {
        _id,
        dutyName: timerStarted
      },
      withCredentials: true
    }).then((res) => {
      setTimerStarted(null)
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }
  return (
    <div>
      <div className="board">
        <Bubble></Bubble>
      </div>
      <Nav></Nav>
      {
        !timerStarted &&
        <Paper sx={{ position: 'fixed', right: 20, bottom: 20 }}>
          <Tooltip title="Start Work Timer">
            <Button variant="contained" onClick={handleStartWorkTimer}>
              <WorkIcon sx={{ mr: 1 }} />
                Work
            </Button>
          </Tooltip>
          <Tooltip title="Start Game Timer">
            <Button variant="extended" onClick={handleStartGameTimer}>
              <VideogameAssetIcon sx={{ mr: 1 }} />
                Game
            </Button>
          </Tooltip>
        </Paper>
      }
      {
        timerStarted &&
        <Paper sx={{ position: 'fixed', right: 20, bottom: 20 }}>
          <Button variant="contained" color='error' onClick={handleStopTimer}>
              Stop
          </Button>
        </Paper>
      }
    </div>
  )
}

export default Home
