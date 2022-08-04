import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Badge, Box, Toolbar, Tooltip, Typography, Avatar, IconButton, MenuItem, Menu } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import axios from 'axios'
import { useGoogleLogout } from 'react-google-login'
import CONST from '../../CONST.js'
import Cookies from 'js-cookie'
import '../../index.css'
import PropTypes from 'prop-types'

ButtonAppBar.propTypes = {
  socket: PropTypes.any
}

export default function ButtonAppBar (props) {
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [me, setMe] = useState(null)

  const navigate = useNavigate()

  const _id = Cookies.get('_id')

  const onLogoutSuccess = () => {
    console.log('LOGOUT SUCCESS!')
  }

  const { signOut } = useGoogleLogout({
    clientId: CONST.clientId,
    onLogoutSuccess
  })

  useEffect(() => {
    axios({
      method: 'GET',
      url: `${CONST.backendURL}/api/user?_id=${_id}`,
      withCredentials: true
    }).then((res) => {
      setMe(res.data.user)
    }).catch((err) => {
      console.log(err)
      navigate('/signin', { replace: true })
    })
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
      url: `${CONST.backendURL}/api/user/signout`,
      withCredentials: true
    }).then(res => {
      console.log(res)
      props.socket.emit('logout', { _id })
      navigate('/signin', { replace: true })
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
            <Tooltip title="Summary" sx={{ marginRight: 3 }}>
              <Badge color="secondary">
                  <CalendarMonthIcon sx={{ cursor: 'pointer' }} onClick={() => navigate('/summary', { replace: true })}/>
              </Badge>
            </Tooltip>
            <Tooltip title="Friends" sx={{ marginRight: 3 }}>
              <Badge color="secondary">
                  <PeopleIcon sx={{ cursor: 'pointer' }} onClick={() => navigate('/friends', { replace: true })}/>
              </Badge>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account">
            <Badge color="secondary">
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
              <MenuItem onClick={logout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
