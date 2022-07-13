import React, { useState } from 'react'
import { AppBar, Badge, Box, Toolbar, Tooltip, Typography, Avatar, IconButton, MenuItem, Menu } from '@mui/material'

// import { Button } from '@mui/material'
// import MenuIcon from '@mui/icons-material/Menu'

// import LogoutButton from '../Sign/logout'
// import LoginButton from '../Sign/login'

import '../../index.css'

export default function ButtonAppBar () {
  // const [auth] = useState(true)
  const pendingRequests = 4
  const [avatar] = useState(null)
  const account = ['Profile', 'Logout', 'Add Friend']
  const [anchorElUser, setAnchorElUser] = React.useState(null)

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar class="nav" position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            slacker-tracker
          </Typography>
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
              {account.map((action) => (
                <MenuItem key={action} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{action}</Typography>
                </MenuItem>
              ))}
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
