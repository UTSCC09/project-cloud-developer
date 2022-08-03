import React from 'react'
import './TimerView.css'
import Nav from '../../components/ui/nav'
import { Box, Tabs, Tab } from '@mui/material'
import PropTypes from 'prop-types'
import Work from './work/Work'
import Study from './study/Study'
import Entertainment from './entertainment/Entertainment'
import Other from './other/Other'

export default function Timer () {
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
    <>
      <Nav></Nav>
      <Box id='timerView-side-nav' sx={{ flexGrow: 1, display: 'flex' }}>
          <Tabs orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}>
              <Tab sx={{ color: 'white' }} label="Work" {...a11yProps(0)}/>
              <Tab sx={{ color: 'white' }} label="Study" {...a11yProps(1)}/>
              <Tab sx={{ color: 'white' }} label="Entertainment" {...a11yProps(2)}/>
              <Tab sx={{ color: 'white' }} label="Other" {...a11yProps(3)}/>
          </Tabs>
          <TabPanel value={value} index={0}>
              <Work />
          </TabPanel>
          <TabPanel value={value} index={1}>
              <Study />
          </TabPanel>
          <TabPanel value={value} index={2}>
              <Entertainment />
          </TabPanel>
          <TabPanel value={value} index={3}>
              <Other />
          </TabPanel>
      </Box>
    </>
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
