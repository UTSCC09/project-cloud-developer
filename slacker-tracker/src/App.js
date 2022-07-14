import React from 'react'
import Nav from './components/ui/nav'
import Timer from './components/timer'
import Bubble from './components/ui/bubble'

function App () {
  return (
    <div className="App">

      {/* Friend bubbles board */}
      <div className="board">
        <Bubble></Bubble>
      </div>

      {/* Add friend */}
      <Timer></Timer>

      {/* Nav bar */}
      <Nav></Nav>
    </div>
  )
}

export default App
