import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Avatar } from '@mui/material'
import Cookies from 'js-cookie'
import timeConvert from '../../utils/timeConvert'
import PropTypes from 'prop-types'

Bubble.propTypes = {
  onlineUsersId: PropTypes.any
}

export default function Bubble (props) {
  const [users, setUsers] = useState(null)
  const [me, setMe] = useState(null)
  const [onlineUsersIdBubble, setonlineUsersIdBubble] = useState(props.onlineUsersId)

  const _id = Cookies.get('_id')

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    setonlineUsersIdBubble(props.onlineUsersId)
    console.log(props.onlineUsersId)
  }, [props.onlineUsersId])

  return (
    <div className="dashboard">
      {me && (
        <div key={me._id} className="me bubble">
          <div>
            <div>
              <div className="name">
                {me.name}
                {/* <div className="bio">{me.email}</div> */}
              </div>
            </div>
            {/* <IconButton alt={me.score} /> */}
          </div>
          <div className="stats">
            {/* {myTime && myTime.allocatedTime && myTime.allocatedTime.map((duty) => (
              <div key={duty._id}>{duty.dutyName}: {duty.timer}</div>
            ))} */}
            <div>Work Time: { timeConvert.convertMsToHM(me.workTimeSpent) }</div>
            <div>Play Time: { timeConvert.convertMsToHM(me.playTimeSpent) }</div>
            <div>Offline Time: { timeConvert.convertMsToHM(me.offlineTimeSpent) }</div>
            <div>Unallocated Time: { timeConvert.convertMsToHM(me.unallocatedTime) }</div>
          </div>
          <div className="score"><div>{me.slackerScore}</div></div>
        </div>
      )}
      {users && users.map((user, index) => (
        <div key={user._id} className="bubble">
          <div>
            <div>
              <div className='status-container'>
                <Avatar className="avatar" src={user.avatar} />
                {(onlineUsersIdBubble.indexOf(user._id) !== -1)
                  ? <div className='online-status-circle'></div>
                  : <div className='offline-status-circle'></div>}
              </div>
              <div className="name">
                {user.name}
                {/* <div className="bio">{user.email}</div> */}
              </div>
            </div>
            {/* <IconButton alt={user.score} /> */}
            <div className="stats">
              {/* {users.timersInfo.at(index).allocatedTime.map((duty) => (
                <div key={duty._id}>{duty.dutyName}: {duty.timer}</div>
              ))} */}
              <div>Work Time: { user.workTimeSpent }</div>
              <div>Play Time: { user.playTimeSpent }</div>
              <div>Offline Time: { user.offlineTimeSpent }</div>
              <div>Unallocated Time: { user.unallocatedTime }</div>
            </div>
          </div>
          <div className="score"><div>{user.slackerScore}</div></div>
        </div>
      ))}
    </div>
  )
}
