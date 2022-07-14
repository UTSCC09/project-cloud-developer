import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Alert } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import Cookies from 'js-cookie'

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
    const senderEmail = Cookies.get('email')

    if (!receiverEmail) return setMissingFieldAlert(true)
    if (!senderEmail) return setMissingCookieAlert(true)

    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/friendList/sendRequest',
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
      setServerAlert(err.response.data.message || 'Please type in a valid email')
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
        fullWidth
        InputLabelProps={{ style: { color: 'white' } }}
        sx={{ marginTop: 2, input: { color: 'white' } }}
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
