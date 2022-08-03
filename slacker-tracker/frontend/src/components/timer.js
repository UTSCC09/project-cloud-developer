import React from 'react'
import { Box, Menu, MenuItem, Fab, Tooltip, styled, Typography } from '@mui/material'
import { PlayArrow } from '@mui/icons-material'
// import CONST from './CONST.js'

export default function Timer () {
  const StyledFab = styled(Fab)({
    position: 'absolute',
    // zIndex: -1,
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    minHeight: 0
    // backgroundColor: CONST.colors.green
    // margin: '0 auto',
  })

  // const StyledAddIcon = styled(Add)({
  //   fontSize: '2.5em'
  // })

  const timers = ['School', 'Work']
  const [anchorElTimer, setAnchorElTimer] = React.useState(null)

  const handleOpenUserTimer = (event) => {
    setAnchorElTimer(event.currentTarget)
  }

  const handleCloseUserTimer = () => {
    setAnchorElTimer(null)
  }

  return (
    <Box>
      <Tooltip title="Add Friend">
        <StyledFab color="primary" aria-label="add" onClick={handleOpenUserTimer}>
          <PlayArrow/>
        </StyledFab>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElTimer}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        open={Boolean(anchorElTimer)}
        onClose={handleCloseUserTimer}
      >
        {timers.map((action) => (
          <MenuItem key={action} onClick={handleCloseUserTimer}>
            <Typography textAlign="center">{action}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
