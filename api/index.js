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
            return res.status(403).json({ error: 'Need authorization token' })
        }
        if (req.headers.authorization !== process.env.API_TOKEN) {
            return res.status(403).json({ error: 'Wrong authorization token' })
        }
    }
    if (req.url !== '/api') {
        return res.status(403).json({ error: 'Wrong url' })
    }
    next()
})


app.post('/api', (req, res) => {
    upload(req, res, (err) => {
        let imgBuffer
        if (err) {
            return res.status(400).json({ error: 'Wrong file' })
        }
        try {
            imgBuffer = req.file.buffer
        }
        catch (e) {
            return res.status(400).json({ error: 'Wrong file' })
        }
        recognize(imgBuffer, cnnPath, (err, result) => {
            if (err) {
                return res.json({ success: 0, captcha: result})
            }
            return res.json({ success: 1, captcha: result })
        })
    })
})
