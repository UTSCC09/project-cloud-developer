import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Signin from './pages/signin/Signin'
import Signup from './pages/signup/Signup'
import Friends from './pages/friends/Friends'
import TimerView from './pages/timerView/TimerView'
import Summary from './pages/summary/Summary'
import { io } from 'socket.io-client'
import CONST from './CONST'

function App () {
  const socket = io(CONST.backendURL)
  const [onlineUsersId, setOnlineUsersId] = React.useState([])

  useEffect(() => {
    socket.on('connect', () => {
      console.log('socket connected')
    })
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`)
    }, [])
    socket.on('updateOnlineUsers', onlineUsersId => {
      if (!setOnlineUsersId) return
      setOnlineUsersId(onlineUsersId.onlineUsersId)
    })
  })

  return (
    <div className="App">
      <Routes>
        <Route path="/home" element={<Home socket={socket} onlineUsersId={onlineUsersId} setOnlineUsersId={setOnlineUsersId} />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/timer" element={<TimerView />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="*" element={<Signin />} />
      </Routes>
    </div>
  )
}

export default App
