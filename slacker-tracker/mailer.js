const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const { workerData, parentPort } = require("worker_threads");
require("dotenv").config();

const convertMsToHM = (milliseconds) => {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = seconds >= 30 ? minutes + 1 : minutes;
  minutes = minutes % 60;
  hours = hours % 24;

  return `${hours.toString().padStart(2, "0")} hours ${minutes
    .toString()
    .padStart(2, "0")} minutes`;
};

const calculatePercentage = function (friendScores, userScore) {
  const friendBelow = friendScores.filter((score) => score <= userScore);
  return Math.round(friendBelow.length / friendScores.length) * 100;
};

const getAvg = function (friendScores, userScore) {
  const sum = friendScores.reduce((arr, cur) => arr + cur) + userScore;
  return Math.round(sum / (friendScores.length + 1));
};

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
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
      user: process.env.EMAIL_USERNAME,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transport;
};

const sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};

console.log("workerdata", workerData);
const sendHTML = `
<div>
  <includetail>
    <table style="font-family: Segoe UI, SegoeUIWF, Arial, sans-serif; font-size: 12px; color: #333333; border-spacing: 0px; border-collapse: collapse; padding: 0px; width: 580px; direction: ltr">
        <tbody>
        <tr>
            <td style="font-size: 10px; padding: 0px 0px 7px 0px; text-align: right">
              Your slacker report for last week
            </td>
        </tr>
        <tr style="background-color: #0078D4">
            <td style="padding: 0px">
                <table style="font-family: Segoe UI, SegoeUIWF, Arial, sans-serif; border-spacing: 0px; border-collapse: collapse; width: 100%">
                    <tbody>
                    <tr>
                        <td style="font-size: 18px; color: #FFFFFF; padding: 12px 10px 5px 22px">
                          Slacker Tracker
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 38px; color: #FFFFFF; padding: 12px 22px 4px 22px" colspan="3">
                          The weekly slacker report
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 20px; color: #FFFFFF; padding: 0px 22px 18px 22px" colspan="3">
                          Your slacker score for last week is ${
                            workerData.slackerScore
                          }
                        </td>
                    </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px 20px; border-bottom-style: solid; border-bottom-color: #0078D4; border-bottom-width: 4px">
                <table style="font-family: Segoe UI, SegoeUIWF, Arial, sans-serif; font-size: 12px; color: #333333; border-spacing: 0px; border-collapse: collapse; width: 100%">
                    <tbody>
                    <tr>
                        <td style="font-size: 12px; padding: 0px 0px 5px 0px">
                            Here is the total time of each event you spent last week:
                            <ul style="font-size: 14px">
                                <li style="padding-top: 10px">
                                  You have spent <span style="color:#0d6efd;">${convertMsToHM(
                                    workerData.workTimeTotal
                                  )}</span> on working.
                                </li>
                                <li>
                                  You have spent <span style="color:#0d6efd;">${convertMsToHM(
                                    workerData.playTimeTotal
                                  )}</span> on gaming.
                                </li>
                                <li>
                                  You have been offline for <span style="color:#0d6efd;">${convertMsToHM(
                                    workerData.offlineTimeTotal
                                  )}</span>
                                </li>
                                <li>
                                  You didn't start your timer for <span style="color:#0d6efd;">${convertMsToHM(
                                    workerData.unallocatedTimeTotal
                                  )}</span> last week
                                </li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 15px; padding: 0px 0px 15px 0px">
                            Your score is higher than <span style="color:#0d6efd;">${calculatePercentage(
                              workerData.friendScores,
                              workerData.slackerScore
                            )}%</span> of your friends'
                        </td>
                    </tr>
                    <tr>
                      <td style="font-size: 15px; padding: 0px 0px 15px 0px">
                      The slacker score average is <span style="color:#0d6efd;">${getAvg(
                        workerData.friendScores,
                        workerData.slackerScore
                      )}</span> for you and your friends 
                        </td>
                    </tr>
                    <tr>
                      <td style="font-size: 15px; padding: 0px;">
                        Want to know more about your slacker information?
                        <a href="www.slackerstracker.com" style="color: #0044CC; text-decoration: none">Visit slackers tracker website</a>
                      </td>
                    </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 35px 0px; color: #B2B2B2; font-size: 12px">
                Slacker Tracker development team
                <br>
                University of Toronto Scarborough
            </td>
        </tr>
        <tr>
            <td style="padding: 0px 0px 10px 0px; color: #B2B2B2; font-size: 12px">
                All rights reserved @ Cloud Developers
            </td>
        </tr>
        </tbody>
    </table>
  </includetail>
</div>`;

sendEmail({
  subject: "Slacker Tracker Daily Summary",
  html: sendHTML,
  to: workerData.sendEmail,
});

parentPort.postMessage({ workerData });
