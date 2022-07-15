import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Signin from './pages/signin/Signin'
import Signup from './pages/signup/Signup'
import Friends from './pages/friends/Friends'
import TimerView from './pages/timerView/TimerView'

function App () {
  return (
    <div className="App">
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/timer" element={<TimerView />} />
        <Route path="*" element={<Signin />} />
      </Routes>
    </div>
  )
}

export default App
