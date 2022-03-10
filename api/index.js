const express = require('express')
const multer = require('multer')
const join = require('path').join
const recognize = require('../utils/recognize')
const cnnPath = join(__dirname, '../model', 'cnn.onnx')

const app = express()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldSize: 10 * 1024,
        fileSize: 10 * 1024,
        files: 1,
        parts: 1,
        fields: 1
    }
}).single('imgfile')

module.exports = app

app.use(function (req, res, next) {
    if (process.env.API_TOKEN) {
        if (!req.headers.authorization) {
            return res.status(401).json({ success: false, error: 'Unauthorized' })
        }
        if (req.headers.Authorization !== process.env.API_TOKEN) {
            return res.status(403).json({ success: false, error: 'Forbidden' })
        }
    }
    if (req.url !== '/api') {
        return res.status(404).json({ success: false, error: 'Not Found' })
    }
    next()
})


app.post('/api', (req, res) => {
    upload(req, res, (err) => {
        let imgBuffer
        if (err) {
            return res.status(400).json({ success: false, error: 'Wrong file' })
        }
        try {
            imgBuffer = req.file.buffer
        }
        catch (e) {
            return res.status(400).json({ success: false, error: 'Wrong file' })
        }
        recognize(imgBuffer, cnnPath, (err, result) => {
            if (err) {
                return res.status(400).json({ success: false, error: result })
            }
            return res.status(200).json({ success: true, captcha: result })
        })
    })
})
