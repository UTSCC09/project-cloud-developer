import React from 'react'
import axios from 'axios'
import { GoogleLogout } from 'react-google-login'

export default function logout () {
  const clientId =
    '131011506414-9hmdp9c3ve0dvun0c3otqpgpovdd2fh9.apps.googleusercontent.com'

  const onSuccess = () => {
    console.log('LOGOUT SUCCESS!')
    axios({
      method: 'GET',
      url: 'http://localhost:3001/api/user/signout'
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <div id="google-signin-button">
      <GoogleLogout
        clientId={clientId}
        buttonText="Logout"
        onLogoutSuccess={onSuccess}
      />
    </div>
  )
}
