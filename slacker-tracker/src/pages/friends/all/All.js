import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Paper, Avatar, Grid, Button } from '@mui/material'

function All () {
  const email = Cookies.get('email')
  const [friends, setFriends] = useState([])

  useEffect(() => {
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/friendList?email=${email}`,
      withCredentials: true
    }).then((res) => {
      setFriends(res.data.data)
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  const handleDelete = friend => {
    axios({
      method: 'DELETE',
      url: 'http://localhost:3001/api/friendList/deleteFriend',
      data: {
        email1: email,
        email2: friend
      },
      withCredentials: true
    }).then((res) => {
      window.location.href = './friends'
      console.log(res)
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
                <Paper elevation={3} key={friend} sx={{ padding: 2, width: 800, margin: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={1}>
                        <Avatar src={null}/>
                      </Grid>
                      <Grid item xs={9}>
                        <div className="friends-email">{friend}</div>
                      </Grid>
                      <Grid item xs={2}>
                        <Button variant="contained" color='error' onClick={() => handleDelete(friend)}>DELETE</Button>
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
