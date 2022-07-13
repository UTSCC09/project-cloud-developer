import React, { useEffect } from 'react'
import LoginButton from './login'
import LogoutButton from './logout'

export default function Login () {
  const clientId =
    '131011506414-9hmdp9c3ve0dvun0c3otqpgpovdd2fh9.apps.googleusercontent.com'

  useEffect(() => {
    function start () {}
  })

  const onSuccess = (res) => {
    console.log('LOGIN SUCCESS! Current user: ', res.profileObj)
  }

  const onFailure = (res) => {
    console.log('LOGIN FAILED! Current user: ', res)
  }

  return (
    <div id="popup">
      <LoginButton />
      <LogoutButton />
    </div>
  )
}
