// utils/fileLogger.js
const fs = require('fs')
const path = require('path')

const LOG_FILE = path.join(__dirname, '../uploaded_images.log')

function logImagePath(imageInfo) {
  const logEntry = `${new Date().toISOString()} | ${JSON.stringify(
    imageInfo
  )}\n`

  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error('写入日志失败:', err)
  })
}

module.exports = { logImagePath }
