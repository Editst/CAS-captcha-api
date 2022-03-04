const express = require('express')
const multer = require('multer')
const getPixels = require("get-pixels")
const onnx = require('onnxruntime-node')

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


app.post('/api', upload.single('imgfile'), async (req, res) => {
    getPixels(req.file.buffer, "image/jpg", async (err, pixels) => {
        if (err) {
            console.log("Bad image path")
            res.json({
                success: -1,
                captcha: ''
            })
            return
        }
        var imgArray = convert2Array(pixels.data, 90, 32)
        var reco = await recognize(imgArray)
        console.log(reco)
        res.json({
            success: 1,
            captcha: reco
        })
    })
})


function convert2Array(imgData, width, height) {
    // convert to 3*90*32
    var imgArray = new Array(3) // channel=3 RGB
    for (var channel = 0; channel != 3; ++channel) {
        imgArray[channel] = new Array(width)
        for (var i = 0; i != width; ++i) {
            imgArray[channel][i] = new Array(height)
            for (var j = 0; j != height; ++j) {
                var index = (i + j * width) * 4
                imgArray[channel][i][j] = imgData[index + channel]
            }
        }
    }
    return imgArray
}

/** must be 90*32 **/
async function recognize(imgArray) {
    var width = 90
    var height = 32
    var strs = ''

    // initialize
    const myOnnxSession = await onnx.InferenceSession.create('./cnn.onnx')
    var input = new onnx.Tensor('float32', imgArray.flat(2), [1, 3, width, height])
    var feeds = { 'input.1': input }
    var output = await myOnnxSession.run(feeds)
    const outputData = output[37].data

    for (var t = 0; t != 4; ++t) {
        ans = outputData.indexOf(Math.max.apply(null, outputData.slice(t * 36, (t + 1) * 36))) - t * 36
        if (ans >= 0 && ans < 26)
            strs += String.fromCharCode(ans + 'a'.charCodeAt(0))
        else
            strs += String.fromCharCode(ans - 26 + '0'.charCodeAt(0))
    }
    return strs
}
