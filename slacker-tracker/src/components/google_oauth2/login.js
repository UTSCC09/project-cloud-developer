import React, { useEffect } from 'react'
import axios from 'axios'
import { GoogleLogin } from 'react-google-login'
import { gapi } from 'gapi-script'
import CONST from '../../CONST.js'

export default function Login () {
  useEffect(() => {
    function start () {
      gapi.client.init({
        clientId: CONST.clientId,
        scope: 'email profile'
      })
    }
    gapi.load('client:auth2', start)
  })

  const onSuccess = (res) => {
    console.log('LOGIN SUCCESS! Current user: ', res)
    axios({
      method: 'POST',
      url: 'http://localhost:3001/api/user/oauth2/google',
      data: {
        googleId: res.profileObj.googleId,
        name: res.profileObj.name,
        email: res.profileObj.email,
        avatar: res.profileObj.imageUrl || null,
        access_token: res.tokenObj.access_token
      },
      withCredentials: true
    })
      .then((res) => {
        console.log(res)
        document.cookie = `email=${res.data.user.email}`
        window.location.href = './home'
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const onFailure = (res) => {
    console.log('LOGIN FAILED! Current user: ', res)
  }

  return (
    <div>
      <GoogleLogin
        clientId={CONST.clientId}
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
        buttonText='Google'
      />
    </div>
  )
}
