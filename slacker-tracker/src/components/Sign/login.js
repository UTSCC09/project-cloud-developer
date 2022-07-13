import React, { useEffect } from 'react'
import { GoogleLogin } from 'react-google-login'
import { gapi } from 'gapi-script'

export default function Login () {
  const clientId =
    '131011506414-9hmdp9c3ve0dvun0c3otqpgpovdd2fh9.apps.googleusercontent.com'

  useEffect(() => {
    function start () {
      gapi.client.init({
        clientId,
        scope: 'email profile'
      })
    }

    gapi.load('client:auth2', start)
  })

  const onSuccess = (res) => {
    console.log('LOGIN SUCCESS! Current user: ', res.profileObj)
  }

  const onFailure = (res) => {
    console.log('LOGIN FAILED! Current user: ', res)
  }

  return (
    <div id="google-signin-button">
      <GoogleLogin
        clientId={clientId}
        buttonText="Login"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
      />
    </div>
  )
}
