import React, { useState } from 'react'
import { Fab, Drawer, Tooltip } from '@mui/material'
import { PlayArrow } from '@mui/icons-material'
import TimerSelect from './timerSelect/TimerSelect'
// import axios from 'axios'
// import Cookies from 'js-cookie'
// import CONST from './CONST.js'

export default function TimerStart () {
  const [showDrawer, setShowDrawer] = useState(false)
  const [selectedTimerDutyName, setSelectedTimerDutyName] = useState('')
  const [timers, setTimers] = useState([])

  return (
    <div>
        <Tooltip sx={{ position: 'fixed', right: 20, bottom: 20 }} title="Start Timer">
          <Fab color="primary" onClick={() => setShowDrawer(true)}>
            <PlayArrow/>
          </Fab>
        </Tooltip>
        <Drawer
            PaperProps={{ style: { width: '25%', padding: 20 } }}
            open={showDrawer}
            onClose={() => setShowDrawer(false)}
          >
            <TimerSelect
              selectedTimerDutyName={ selectedTimerDutyName }
              setSelectedTimerDutyName = { setSelectedTimerDutyName }
              timers = { timers }
              setTimers = { setTimers }
            />
        </Drawer>
    </div>
  )
}
