import CONST from '../CONST'

const timeConvert = {
  convertMsToHM: (milliseconds) => {
    if (milliseconds < 1000) return '00:00'
    // let seconds = Math.floor(milliseconds / 1000)
    // let minutes = Math.floor(seconds / 60)
    // let hours = Math.floor(minutes / 60)
    const hours = Math.floor(milliseconds / (CONST.milsecPerMin * 60))
    const minutes = Math.round(milliseconds / CONST.milsecPerMin - (hours * 60))
    // seconds = seconds % 60
    // minutes = seconds >= 30 ? minutes + 1 : minutes
    // minutes = minutes % 60
    // hours = hours % 24
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  },
  convertMsToHMS: (milliseconds) => {
    if (milliseconds < 1000) return '00:00:00'
    // let seconds = Math.floor(milliseconds / 1000)
    // let minutes = Math.floor(seconds / 60)
    // let hours = Math.floor(minutes / 60)
    const hours = Math.floor(milliseconds / (CONST.milsecPerMin * 60))
    const minutes = Math.floor(milliseconds / CONST.milsecPerMin - (hours * 60))
    const seconds = Math.round(milliseconds / 1000 - (hours * 60 + minutes * 60))
    // seconds = seconds % 60
    // minutes = seconds >= 30 ? minutes + 1 : minutes
    // minutes = minutes % 60
    // hours = hours % 24
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

export default timeConvert
