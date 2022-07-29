const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const { workerData, parentPort } = require('worker_threads')
require('dotenv').config()


const convertMsToHM = (milliseconds) => {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  seconds = seconds % 60
  minutes = seconds >= 30 ? minutes + 1 : minutes
  minutes = minutes % 60
  hours = hours % 24

  return `${hours.toString().padStart(2, '0')} hours ${minutes.toString().padStart(2, '0')} minutes`
}

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
  
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject("Failed to create access token :(");
          }
          resolve(token);
        });
    });

    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            user: process.env.EMAIL_USERNAME
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    return transport;
};

const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
};

console.log('workerdata', workerData)
const sendHTML = 
`<div>
  <h2>Hello! Here is slacker tracker daily summary of <span style="color:#0d6efd;">${workerData.name}</span>!</h2>
  <br/>
  <h2>Your Slacker Score: <span style="color:#0d6efd;">${workerData.slackerScore}</span></h2>
  <h3>Total Work Time: <span style="color:#0d6efd;">${convertMsToHM(workerData.workTimeTotal)}</span></h3>
  <h3>Total Game Time: <span style="color:#0d6efd;">${convertMsToHM(workerData.playTimeTotal)}</span></h3>
  <h3>Total Offline Time: <span style="color:#0d6efd;">${convertMsToHM(workerData.offlineTimeTotal)}</span></h3>
  <h3>Total Unallocated Time: <span style="color:#0d6efd;">${convertMsToHM(workerData.unallocatedTimeTotal)}</span></h3>
</div>`

sendEmail({
    subject: "Slacker Tracker Daily Summary",
    html: sendHTML,
    to: workerData.sendEmail
});

parentPort.postMessage({ workerData })