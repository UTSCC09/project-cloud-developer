import React from 'react'
import Nav from '../../components/ui/nav'
import TimerStart from './timerStart/TimerStart'
import Bubble from '../../components/ui/bubble'

function Home () {
  return (
    <div>

      {/* Friend bubbles board */}
      <div className="board">
        <Bubble></Bubble>
      </div>

      {/* Add friend */}
      {/* <Timer></Timer> */}
      <TimerStart />

      {/* Nav bar */}
      <Nav></Nav>
    </div>
  )
}

export default Home
