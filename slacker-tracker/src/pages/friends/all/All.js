import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Paper, Avatar, Button } from '@mui/material'
import '../../../index.css'

function All () {
  const _id = Cookies.get('_id')
  const [friends, setFriends] = useState([])

  useEffect(() => {
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/friendList?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      setFriends(res.data.data)
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleDelete = friendEmail => {
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/user?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      console.log(res.data.user.email)
      const email1 = res.data.user.email
      axios({
        method: 'DELETE',
        url: 'http://localhost:3001/api/friendList/deleteFriend',
        data: {
          email1,
          email2: friendEmail
        },
        withCredentials: true
      }).then((res) => {
        setFriends(friends.filter(friend => {
          return friend.email !== friendEmail
        }))
        console.log(res)
      }).catch((err) => {
        console.log(err)
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <>
      <h2>ALL FRIENDS</h2>
      <div className="friends">
        {
            friends.map(friend => {
              return (
                <Paper className='friendReq' elevation={3} key={friend._id} sx={{ padding: 2, margin: 1 }}>
                  <div>
                    <Avatar src={null}/>
                    <div className="friends-email">{friend.name}</div>
                    <div className="friends-email">{friend.email}</div>
                  </div>
                  <Button variant="contained" color='error' onClick={() => handleDelete(friend.email)}>DELETE</Button>
                </Paper>
              )
            })
          }
      </div>
    </>
  )
}

export default All
