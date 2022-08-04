import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Alert } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import Cookies from 'js-cookie'
import CONST from '../../../CONST.js'
import '../../../index.css'

function AddFriends () {
  const [missingFieldAlert, setMissingFieldAlert] = useState(false)
  const [missingCookieAlert, setMissingCookieAlert] = useState(false)
  const [serverAlert, setServerAlert] = useState(null)
  const [sendSuccess, setSendSuccess] = useState(false)
  const handleAddFriends = () => {
    setMissingFieldAlert(false)
    setMissingCookieAlert(false)
    setServerAlert(null)
    setSendSuccess(false)

    const receiverEmail = document.getElementById('add-friends-email-input').value
    const _id = Cookies.get('_id')

    if (!receiverEmail) return setMissingFieldAlert(true)
    if (!_id) return setMissingCookieAlert(true)

    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/user?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res)
      console.log(res.data.user.email)
      const senderEmail = res.data.user.email
      axios({
        method: 'POST',
        url: `${CONST.backendURL}/api/friendList/sendRequest`,
        data: {
          receiverEmail,
          senderEmail
        },
        withCredentials: true
      }).then((res) => {
        console.log(res)
        setSendSuccess(true)
      }).catch((err) => {
        console.log(err)
        setServerAlert((err.reponse.data && err.response.data.message) || 'Please type in a valid email')
      })
    }).catch((err) => {
      console.log(err)
      return setServerAlert((err.reponse.data && err.response.data.message) || 'Please type in a valid email')
    })
  }
  return (
    <>
      <h2>ADD FRIENDS</h2>
      <div>You can add a friend with their email.</div>
      {missingFieldAlert ? <Alert severity="error">Please fill all the field</Alert> : null}
      {missingCookieAlert ? <Alert severity="error">Session time out! Please try to log in again</Alert> : null}
      {sendSuccess ? <Alert severity="success">Request sent successfully</Alert> : null}
      {serverAlert ? <Alert severity="error">{ serverAlert }</Alert> : null}
      <TextField
        className='fg'
        fullWidth
        InputLabelProps={{ style: { color: 'var(--fg_color)' } }}
        sx={{ marginTop: 2, input: { color: 'var(--fg_color)' } }}
        color="secondary"
        label="Enter a email"
        type="email"
        id='add-friends-email-input'
      />
      <Button
        id="add-friends-button"
        variant="contained"
        sx={{ marginTop: 2 }}
        onClick={handleAddFriends}
        endIcon={<SendIcon />}
      >
        Send Friend Request
      </Button>
    </>
  )
}

export default AddFriends
