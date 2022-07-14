import React from 'react';
import axios from 'axios';
import { GoogleLogin} from 'react-google-login';
import { useEffect } from 'react';
import { gapi } from 'gapi-script';

export default function Login () {
  const clientId =
    '131011506414-9hmdp9c3ve0dvun0c3otqpgpovdd2fh9.apps.googleusercontent.com'

    const clientId = "131011506414-9hmdp9c3ve0dvun0c3otqpgpovdd2fh9.apps.googleusercontent.com";

    useEffect(() => {
        function start() {
            gapi.client.init({
                clientId: clientId,
                scope: "email profile"
            })
        }

        gapi.load('client:auth2', start);
    })

    const onSuccess = res => {
        console.log("LOGIN SUCCESS! Current user: ", res);
        axios({
            method: "POST",
            url: "http://localhost:3001/api/user/oauth2/google",
            data: {
                googleId: res.profileObj.googleId,
                username: res.profileObj.name,
                email: res.profileObj.email,
                avatar: res.profileObj.imageUrl || null,
                access_token: res.tokenObj.access_token
            }
        }).then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err);
        });
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
