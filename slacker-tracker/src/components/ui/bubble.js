import React from 'react'
import { Avatar } from '@mui/material'
// import { Add } from '@mui/icons-material'

import '../../index.css'
// import AddFriend from './add_friend'

export default function Bubble () {
  const users = [
    {
      username: 'John',
      bio: 'What\'s up',
      avatar: '',
      score: 23
    },
    {
      username: 'Sam',
      bio: 'Hey peeps',
      avatar: '',
      score: 1
    },
    {
      username: 'Kate',
      bio: 'Like that',
      avatar: '',
      score: -5
    }
  ]

  return (
    <div className="dashboard">
      {users.map((user) => (
        <div key={user.username} className="bubble">
          <div>
            <Avatar src={user.avatar} />
            <div className="name">
              {user.username}
              <div className="bio">{user.bio}</div>
            </div>
          </div>
          {/* <IconButton alt={user.score} /> */}
          <div className="score"><div>{user.score}</div></div>
        </div>
      ))}
      {/* <Tooltip title="Add Friend">
        <Fab color="primary" aria-label="add">
          <Add />
        </Fab>
      </Tooltip> */}
    </div>
  )
}
