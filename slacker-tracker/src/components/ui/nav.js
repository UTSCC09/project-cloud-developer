import React, { useState } from 'react'
import { AppBar, Badge, Box, Toolbar, Tooltip, Typography, Avatar, IconButton, MenuItem, Menu } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import '../../index.css'

export default function ButtonAppBar () {
  const pendingRequests = 4
  const [avatar] = useState(null)
  const account = ['Profile', 'Logout', 'Add Friend']
  const [anchorElUser, setAnchorElUser] = useState(null)

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar className="nav" position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            slacker-tracker
          </Typography>
          <Box sx={{ margin: 3 }}>
            <Tooltip title="Friends">
              <Badge color="secondary" badgeContent={10} max={99}>
                  <PeopleIcon onClick={() => { window.location.href = './friends' }}/>
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
