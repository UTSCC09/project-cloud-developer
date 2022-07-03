import React from 'react';
import { GoogleLogout } from 'react-google-login';

export default function logout() {

  const clientId = "131011506414-9hmdp9c3ve0dvun0c3otqpgpovdd2fh9.apps.googleusercontent.com";

  const onSuccess = () => {
    console.log("LOGOUT SUCCESS!");
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
