const join = require('path').join
const recognize = require('../utils/recognize')
const cnnPath = join(__dirname, '../model', 'cnn.onnx')

recognize('https://cas.sysu.edu.cn/cas/captcha.jsp', cnnPath, (err, result) => {
    if (err) {
        console.log(err)
        console.log(result)
        return
    }
    return console.log(result)
})
