import React, { useEffect, useState } from 'react'
import { Avatar } from '@mui/material'
import timeConvert from '../../utils/timeConvert'
import PropTypes from 'prop-types'
import Bar from './bar'
import CONST from '../../CONST'
import './bubble.css'

Bubble.propTypes = {
  onlineUsersId: PropTypes.any,
  me: PropTypes.any,
  users: PropTypes.any,
  refreshBubbles: PropTypes.func
}

export default function Bubble (props) {
  const [onlineUsersIdBubble, setonlineUsersIdBubble] = useState(props.onlineUsersId)
  const [me, setMe] = useState(props.me)
  const [users, setUsers] = useState(props.users)

  useEffect(() => {
    setonlineUsersIdBubble(props.onlineUsersId)
    setMe(props.me)
    setUsers(props.users)
    // props.refreshBubbles()
    console.log(props.onlineUsersId)
  }, [props.onlineUsersId, props.me, props.users])

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
            <Bar workTime={ me.workTimeSpent / CONST.milsecPerMin } playTime={ me.playTimeSpent / CONST.milsecPerMin } offlineTime={ me.offlineTimeSpent / CONST.milsecPerMin } unallocatedTime={ me.unallocatedTime / CONST.milsecPerMin } ></Bar>
            <div className="details">
              <div className={me.duty.name === 'work' ? 'glow' : ''}><div>Work:</div><div>{ timeConvert.convertMsToHM(me.workTimeSpent) } hrs</div></div>
              <div className={me.duty.name === 'play' ? 'glow' : ''}><div>Play:</div><div>{ timeConvert.convertMsToHM(me.playTimeSpent) } hrs</div></div>
              <div className={me.duty.name === 'offline' ? 'glow' : ''}><div>Offline:</div><div>{ timeConvert.convertMsToHM(me.offlineTimeSpent) } hrs</div></div>
              <div className={me.duty.name === 'unallocate' ? 'glow' : ''}><div>Unallocated:</div><div>{ timeConvert.convertMsToHM(me.unallocatedTime) } hrs</div></div>
            </div>
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
              <Bar workTime={ user.workTimeSpent / CONST.milsecPerMin } playTime={ user.playTimeSpent / CONST.milsecPerMin } offlineTime={ user.offlineTimeSpent / CONST.milsecPerMin } unallocatedTime={ user.unallocatedTimeSpent / CONST.milsecPerMin } ></Bar>
              <div className="details">
                <div className={user.duty.name === 'work' ? 'glow' : ''}><div>Work:</div><div>{ timeConvert.convertMsToHM(user.workTimeSpent) } hrs</div></div>
                <div className={user.duty.name === 'play' ? 'glow' : ''}><div>Play:</div><div>{ timeConvert.convertMsToHM(user.playTimeSpent) } hrs</div></div>
                <div className={user.duty.name === 'offline' ? 'glow' : ''}><div>Offline:</div><div>{ timeConvert.convertMsToHM(user.offlineTimeSpent) } hrs</div></div>
                <div className={user.duty.name === 'unallocate' ? 'glow' : ''}><div>Unallocated:</div><div>{ timeConvert.convertMsToHM(user.unallocatedTimeSpent) } hrs</div></div>
              </div>
            </div>
          </div>
          <div className={determineScoreLevel(user.slackerScore)}><div>{user.slackerScore}</div></div>
        </div>
      ))}

    </div>
  )
}
