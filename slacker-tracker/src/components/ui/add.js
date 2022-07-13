import React from 'react'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import Fab from '@mui/material/Fab'

export default function Add () {
  const StyledFab = styled(Fab)({
    position: 'absolute',
    zIndex: 1,
    bottom: 10,
    right: 10
    // margin: '0 auto',
  })

  return (
    <StyledFab color="primary" aria-label="add">
      <AddIcon />
    </StyledFab>
  )
}
