import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Badge, Box, Toolbar, Tooltip, Typography, Avatar, IconButton, MenuItem, Menu } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
// import AccessTimeIcon from '@mui/icons-material/AccessTime'
import axios from 'axios'
import { useGoogleLogout } from 'react-google-login'
import CONST from '../../CONST'
import Cookies from 'js-cookie'
import '../../index.css'
import { io } from 'socket.io-client'
import PropTypes from 'prop-types'

ButtonAppBar.propTypes = {
  setOnlineUsersId: PropTypes.any
}

export default function ButtonAppBar (props) {
  const pendingRequests = 0
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [me, setMe] = useState(null)
  const navigate = useNavigate()
  const socket = io('http://localhost:3001')
  const { setOnlineUsersId } = props

  const onLogoutSuccess = () => {
    console.log('LOGOUT SUCCESS!')
  }

  const { signOut } = useGoogleLogout({
    clientId: CONST.clientId,
    onLogoutSuccess
  })

  const _id = Cookies.get('_id')

  useEffect(() => {
    axios({
      method: 'GET',
      url: `http://localhost:3001/api/user?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      console.log(res.data.user)
      setMe(res.data.user)
      socket.on('connect', () => {
        console.log('socket connected')
        socket.emit('login', { _id })
      })
      socket.on('connect_error', (err) => {
        console.log(`connect_error due to ${err.message}`)
      })
      socket.on('updateOnlineUsers', onlineUsersId => {
        setOnlineUsersId(onlineUsersId.onlineUsersId)
        console.log(onlineUsersId)
      })
    }).catch((err) => {
      console.log(err)
      navigate('/signin', { replace: true })
    })
    console.log(me)
  }, [])

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const logout = () => {
    signOut()
    axios({
      method: 'GET',
      url: 'http://localhost:3001/api/user/signout',
      withCredentials: true
    }).then(res => {
      console.log(res)
      onLogoutSuccess()
      socket.emit('logout', { _id })
      window.location.href = './signin'
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar className="nav" position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => { window.location.href = './home' }}>
            Slacker Tracker
          </Typography>
          <Box>
            {/* <Tooltip title="Timer" sx={{ marginRight: 3 }}>
              <Badge color="secondary">
                  <AccessTimeIcon sx={{ cursor: 'pointer' }} onClick={() => navigate('/timer', { replace: true })}/>
              </Badge>
            </Tooltip> */}
            <Tooltip title="Friends" sx={{ marginRight: 3 }}>
              <Badge color="secondary">
                  <PeopleIcon sx={{ cursor: 'pointer' }} onClick={() => navigate('/friends', { replace: true })}/>
              </Badge>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account">
            <Badge badgeContent={pendingRequests} color="secondary">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  { me && <Avatar src={me.avatar}/>}
                  { !me && <Avatar src=''/>}
              </IconButton>
              </Badge>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={logout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
              {/* <Menu
                className="menu"
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <LoginButton></LoginButton>
                <LogoutButton></LogoutButton>
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Menu> */}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
