import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import AccountCircle from '@mui/icons-material/AccountCircle'
// import Avatar from '@mui/material/Avatar'
// import { Button } from '@mui/material'
// import MenuItem from '@mui/material/MenuItem'
// import Menu from '@mui/material/Menu'
import IconButton from '@mui/material/IconButton'
// import LogoutButton from '../Sign/logout'
// import LoginButton from '../Sign/login'
// import MenuIcon from '@mui/icons-material/Menu';

import '../../index.css'

export default function ButtonAppBar () {
  const [auth] = useState(true)
  // const [avatar] = useState("")
  // // const [anchorEl, setAnchorEl] = React.useState(null)

  // const handleMenu = (event) => {
  //   setAnchorEl(event.currentTarget)
  // }

  // const handleClose = () => {
  //   setAnchorEl(null)
  // }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar class="nav" position="fixed">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            slacker-tracker
          </Typography>
          {auth && (
            <div>
              {/* <Avatar alt="" src={} /> */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                // onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
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
            </div>
          )}
          {/* <Button color="inherit">Add Friend</Button> */}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
