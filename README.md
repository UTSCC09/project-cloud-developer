# CSCC09 Web Project Beta version

### Team Members

> The team members for this web project are Jiayu Lu, Dezhi Ren, and Andrew D’Amario.

### Project Description

### *slacker-tracker*

*It will never leave you lacking... if you be slacking, it be tracking... so get hacking!*

Many of us (especially computer science students) suffer from spending too much time on the computer which is very bad for our health. Moreover, we often find ourselves wasting too much time on the computer, gaming or doing something recreational like social media, rather than the work we should be doing... and for some, they work too much and don't take the breaks they should. *slacker tracker* is a Full-stack Web Application that helps you track the amount of time you spend, working, gaming, and offline. Using the optimal ranges (with respect to healthy living) of times we should be spending doing these things every week, *slacker tracker* helps you see if you have a healthy balanced life or not. When you are working on the computer, run the work timer. When you are gaming (recreating on the computer), run the play timer. When you are off the computer (the app is closed), it keeps track of your offline time. Lastly, to make sure you don't cheat, you have an hour’s leeway of unallocated time when you are on your computer (app is open) but haven't started the play or work timer.

If at the end of the week you have spent an acceptable amount of time doing each of these things, your *slacker tracker* score will increase, if not, it will decrease. In this way you have accountability with the friends in your group who can see how well (or not) you are doing this week, and how high or low your *slacker tracker* score is (how well users have been managing their time in general). So friends can help each other stay on track and live happier, healthier, and more balanced lives!

**Optimal Ranges per week**

- 30 <= work <= 60
- 3 <= game <= 20
- 90 <= offline <= 120
- unallocated_optimal <= 1

### Challenge Factor

* Oauth: email confirmation and Google sign in.
* Secure interactions with docker container and restrict viewing of user information to friends only.
* Scalability.
* Non-trivial frontend: animate 3D graph bars and slacker-tracker score metallic badge.
* Real-time interactions: current status, current running timer (live updates to 3D graph, and indication and duration of currently running timer) and record the time when user closes/open app or the app is no longer active.

### Beta version

* User authentication, username and password sign up and sign in.
* Adding friends (two way adding and accept friends).
* Starting/stopping work or school timer.
* Seeing your friends statistics.

### Final version

* Add user details: name, avatar, bio, and slacker-tracker score.
* Seeing friends 3D weekly bar graph of their time allocation summary and 3D slacker-tracker score badge.
* Offline time is calculated when the app is not open i.e. not on your computer, and unallocated time when you are running any timer.
* Getting system notification if user is not tracking their time.
* Send encouraging notification to friends.

### Technology Stack

**Frontend**: React.js, MaterialUI

**Backend**: Nodejs, GraphQL

**Database**: MongoDB

### Deployment

AWS with Ubuntu VM and Docker