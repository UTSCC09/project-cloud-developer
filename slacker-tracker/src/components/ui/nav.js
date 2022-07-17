import React, { useState } from 'react'
import { AppBar, Badge, Box, Toolbar, Tooltip, Typography, Avatar, IconButton, MenuItem, Menu } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
// import AccessTimeIcon from '@mui/icons-material/AccessTime'
import axios from 'axios'
import { useGoogleLogout } from 'react-google-login'
import CONST from '../../CONST'
// import LoginButton from '../../components/google_oauth2/login'
import '../../index.css'

export default function ButtonAppBar () {
  const pendingRequests = 0
  const [avatar] = useState(null)
  const [anchorElUser, setAnchorElUser] = useState(null)

  const onLogoutSuccess = () => {
    console.log('LOGOUT SUCCESS!')
  }

  const { signOut } = useGoogleLogout({
    clientId: CONST.clientId,
    onLogoutSuccess
  })

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
      url: 'http://localhost:3001/api/user/signout'
    }).then(res => {
      console.log(res)
      onLogoutSuccess()
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
                  <AccessTimeIcon sx={{ cursor: 'pointer' }} onClick={() => { window.location.href = './timer' }}/>
              </Badge>
            </Tooltip> */}
            <Tooltip title="Friends" sx={{ marginRight: 3 }}>
              <Badge color="secondary">
                  <PeopleIcon sx={{ cursor: 'pointer' }} onClick={() => { window.location.href = './friends' }}/>
              </Badge>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account">
            <Badge badgeContent={pendingRequests} color="secondary">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar src={avatar}/>
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
