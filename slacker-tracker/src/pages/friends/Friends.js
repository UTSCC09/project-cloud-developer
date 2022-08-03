import React from 'react'
// import axios from 'axios'
import AddFriends from './addFriends/AddFriends'
import All from './all/All'
import Pending from './pending/Pending'
import PropTypes from 'prop-types'
import './Friends.css'
import Nav from '../../components/ui/nav'
import { Box, Tabs, Tab } from '@mui/material'

function Friends () {
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const a11yProps = (index) => {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`
    }
  }

  return (
    <div>
        <Nav></Nav>
        <Box id='friends-side-nav' sx={{ flexGrow: 1, display: 'flex' }}>
            <Tabs className='tabs'
                  orientation="vertical"
                  variant="scrollable"
                  value={value}
                  onChange={handleChange}
                  sx={{ overflow: 'visible', borderRight: 1, borderColor: 'divider' }}>
                <Tab sx={{ color: 'var(--fg_color)' }} label="All" {...a11yProps(0)}/>
                <Tab sx={{ color: 'var(--fg_color)' }} label="Pending" {...a11yProps(1)}/>
                <Tab sx={{ color: 'var(--fg_color)' }} label="Add Friends" {...a11yProps(2)}/>
            </Tabs>
            <TabPanel value={value} index={0}>
                <All />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Pending />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <AddFriends />
            </TabPanel>
        </Box>
    </div>
  )
}

TabPanel.propTypes = {
  value: PropTypes.any,
  index: PropTypes.any,
  children: PropTypes.object
}

function TabPanel (props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default Friends
