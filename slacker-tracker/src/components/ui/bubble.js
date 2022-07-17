import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Avatar } from '@mui/material'
import Cookies from 'js-cookie'
// import { Add } from '@mui/icons-material'

import '../../index.css'
// import AddFriend from './add_friend'

export default function Bubble () {
  const [users, setUsers] = useState(null)
  const [me, setMe] = useState(null)
  const [myTime, setMyTime] = useState(null)

  //   {
  //     username: 'Sam',
  //     bio: 'Hey peeps',
  //     avatar: '',
  //     score: 1
  //   },
  //   {
  //     username: 'Kate',
  //     bio: 'Like that',
  //     avatar: '',
  //     score: -5
  //   }
  // ]
  const email = Cookies.get('email')

  useEffect(() => {
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/user?email=${email}`,
      withCredentials: true
    }).then((res) => {
      console.log(res.data.user)
      setMe(res.data.user)
    }).catch((err) => {
      console.log(err)
    })
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/timer/self?email=${email}`,
      withCredentials: true
    }).then((res) => {
      console.log(res.data.data)
      setMyTime(res.data.data)
    }).catch((err) => {
      console.log(err)
    })
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/friendList/getFriendsInfo?email=${email}`,
      withCredentials: true
    }).then((res) => {
      console.log(res.data.data)
      setUsers(res.data.data)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  return (
    <div className="dashboard">
      {me && (
        <div key={me._id} className="me bubble">
          <div>
            <div>
              <div className="name">
                {me.username}
                <div className="bio">{me.email}</div>
              </div>
            </div>
            {/* <IconButton alt={me.score} /> */}
          </div>
          <div className="stats">
            {myTime && myTime.allocatedTime && myTime.allocatedTime.map((duty) => (
              <div key={duty._id}>{duty.dutyName}: {duty.timer}</div>
            ))}
          </div>
          <div className="score"><div>{me.score}</div></div>
        </div>
      )}
      {users && users.friendsInfo.map((user, index) => (
        <div key={user._id} className="bubble">
          <div>
            <div>
              <Avatar className="avatar" src={user.avatar} />
              <div className="name">
                {user.username}
                <div className="bio">{user.email}</div>
              </div>
            </div>
            {/* <IconButton alt={user.score} /> */}
            <div className="stats">
              {users.timersInfo.at(index).allocatedTime.map((duty) => (
                <div key={duty._id}>{duty.dutyName}: {duty.timer}</div>
              ))}
            </div>
          </div>
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
