import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Avatar } from '@mui/material'
import Cookies from 'js-cookie'
import timeConvert from '../../utils/timeConvert'
import PropTypes from 'prop-types'
import Bar from './bar'

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

  const determineScoreLevel = score => {
    if (score < 20) return 'score bad'
    else if (score < 50) return 'score low'
    else return 'score high'
  }

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
            <Bar></Bar>
            <div>Work Time: { timeConvert.convertMsToHM(me.workTimeSpent) }</div>
            <div>Play Time: { timeConvert.convertMsToHM(me.playTimeSpent) }</div>
            <div>Offline Time: { timeConvert.convertMsToHM(me.offlineTimeSpent) }</div>
            <div>Unallocated Time: { timeConvert.convertMsToHM(me.unallocatedTime) }</div>
          </div>
          <div className={determineScoreLevel(me.slackerScore)}><div>{me.slackerScore}</div></div>
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
              <div>Work Time: { timeConvert.convertMsToHM(user.workTimeSpent) }</div>
              <div>Play Time: { timeConvert.convertMsToHM(user.playTimeSpent) }</div>
              <div>Offline Time: { timeConvert.convertMsToHM(user.offlineTimeSpent) }</div>
              <div>Unallocated Time: { timeConvert.convertMsToHM(user.unallocatedTimeSpent) }</div>
            </div>
          </div>
          <div className={determineScoreLevel(user.slackerScore)}><div>{user.slackerScore}</div></div>
        </div>
      ))}

    </div>
  )
}
