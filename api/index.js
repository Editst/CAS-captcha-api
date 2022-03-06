const express = require('express')
const multer = require('multer')
const join = require('path').join
const recognize = require('../utils/recognize')

const app = express()
const storage = multer.memoryStorage()
const limits = {
    fieldSize: 10 * 1024,
    fileSize: 10 * 1024,
    files: 1,
    parts: 1,
    fields: 1
}
const upload = multer({ storage: storage, limits: limits })
const cnnPath = join(__dirname, './cnn.onnx')

module.exports = app

app.use(function (req, res, next) {
    if (!req.headers.authorization || req.headers.authorization !== process.env.API_TOKEN) {
        return res.status(403).json({error: '403 Forbidden'})
    }
    if (req.url !== '/api') {
        return res.status(403).json({error: '403 Forbidden'})
    }
    next()
})


app.post('/api', upload.single('imgfile'), (req, res) => {
    recognize(req.file.buffer, cnnPath, (err, result) => {
        if (err) {
            return res.json({ success: 0, captcha: result })
        }
        return res.json({ success: 1, captcha: result })
    })
})
