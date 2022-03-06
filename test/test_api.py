import requests

captcha_url = "https://cas.sysu.edu.cn/cas/captcha.jsp"
imbyte = requests.get(captcha_url).content

r = requests.post('http://localhost:3000/api', files={'imgfile': ('captcha.jpg', imbyte)})
print(r.text)
