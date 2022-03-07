# CAS-captcha-api

受 [CAS-captcha](https://github.com/Qjbtiger/CAS-captcha) 启发，使用其训练得到的 onnx 文件搭建的在线验证码识别 api，部署在 vercel 平台。

## 使用

```py
import requests
import json

captcha_url = "https://cas.sysu.edu.cn/cas/captcha.jsp"
imbyte = requests.get(captcha_url).content

def recognize(imbyte):
    headers = {'Authorization': 'TOKEN'}
    r = requests.post(f'https://cascaptcha.vercel.app/api', files={'imgfile': ('captcha.jpg', imbyte)},
                    headers=headers)
    res = json.loads(r.text)
    if res['success']:
        return res['captcha']
    return False

print(recognize(imbyte))
```

## 注意

为避免滥用，设置了 token 验证，可自行 fork 后在 vercel 搭建使用
