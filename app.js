const express = require('express')
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { logImagePath } = require('./utils/fileLogger')
const fs = require('fs')

const app = express()
const PORT = 3000
app.enable('trust proxy')
// 中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/images', express.static('uploads'))

// 动态存储配置
const getStorage = (folder = '', uuuid = false) => {
  const uploadPath = path.join('uploads', folder)

  // 确保目录存在
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      const uniqueName = uuuid
        ? `${uuidv4()}${path.extname(file.originalname)}`
        : file.originalname
      cb(null, uniqueName)
    },
  })
}

// 文件过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed!'),
      false
    )
  }
}

// 确保上传目录存在
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

const getBaseUrl = (referer) => {
  try {
    const url = new URL(referer)
    return `${url.protocol}//${url.host}` // 确保结尾有/
  } catch (e) {
    // 备用方案（如果Referer无效）
    console.log(e)
    return 'https://127.0.0.1' // 默认值
  }
}

// 批量上传路由
app.post('/upload-multiple', (req, res, next) => {
  const folder = req.query.folder || ''
  const uuuid = req.query.useUUID === 'true'
  const uploadMiddleware = multer({
    storage: getStorage(folder, uuuid),
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
  }).array('images', 10) // 最多10个文件

  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message })
      }
      return res.status(500).json({ error: err.message })
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: 'No files uploaded or invalid file types' })
    }

    const baseUrl = `${getBaseUrl(req.headers.referer)}/images`
    const folderPath = folder ? `${folder}/` : ''

    const uploadedFiles = req.files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      url: `${baseUrl}/${folderPath}${file.filename}`,
      path: folderPath,
    }))

    // ========== 在这里调用日志记录 ==========
    uploadedFiles.forEach((file) => {
      logImagePath({
        originalName: file.originalName,
        filename: file.filename,
        serverPath: file.serverPath,
        url: file.url,
        size: file.size,
        uploadTime: new Date().toISOString(),
      })
    })
    // ======================================

    res.json({
      success: true,
      count: uploadedFiles.length,
      folder: folder,
      files: uploadedFiles,
    })
  })
})

// 静态文件服务
app.use(express.static('public'))

// 错误处理
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`Image hosting service running on http://localhost:${PORT}`)
})
