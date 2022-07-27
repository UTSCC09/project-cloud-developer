import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Paper, Avatar, Grid, Button } from '@mui/material'

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
      {
            friends.map(friend => {
              return (
                <Paper elevation={3} key={friend._id} sx={{ padding: 2, width: 800, margin: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={1}>
                        <Avatar src={null}/>
                      </Grid>
                      <Grid item xs={9}>
                      <div className="friends-email">{friend.name}</div>
                        <div className="friends-email">{friend.email}</div>
                      </Grid>
                      <Grid item xs={2}>
                        <Button variant="contained" color='error' onClick={() => handleDelete(friend.email)}>DELETE</Button>
                      </Grid>
                    </Grid>
                </Paper>
              )
            })
        }
    </>
  )
}

export default All
