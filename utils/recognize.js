const getPixels = require("get-pixels")
const onnx = require('onnxruntime-node')


module.exports = (imgPath, onnxPath, cb) => {
    getPixels(imgPath, "image/jpg", async (err, pixels) => {
        if (err) {
            return cb(err, "Bad image")
        }
        let imgArray = convert2Array(pixels.data, 90, 32)
        let recResult = await recognize(imgArray, onnxPath)
        cb(null, recResult)
    })
}


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
async function recognize(imgArray, onnxPath) {
    var width = 90
    var height = 32
    var strs = ''

    // initialize
    const myOnnxSession = await onnx.InferenceSession.create(onnxPath)
    var input = new onnx.Tensor('float32', imgArray.flat(2), [1, 3, width, height])
    var feeds = { 'input.1': input }
    var output = await myOnnxSession.run(feeds)
    const outputData = output[37].data

    for (var t = 0; t != 4; ++t) {
        var ans = outputData.indexOf(Math.max.apply(null, outputData.slice(t * 36, (t + 1) * 36))) - t * 36
        if (ans >= 0 && ans < 26)
            strs += String.fromCharCode(ans + 'a'.charCodeAt(0))
        else
            strs += String.fromCharCode(ans - 26 + '0'.charCodeAt(0))
    }
    return strs
}
