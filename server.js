const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')

const app = express()

app.use(cors())
app.use(express.text({ limit: '10mb' }))

const emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yieldx.dev@gmail.com',
    pass: 'qxkaaajeobfflkph',
  },
})

app.get('/test', (req, res) => {
  res.send('test ok!')
})

app.get('/', (req, res) => {
  res.send('welcome to the backend (:')
})

let currentText = []

app.post('/email-logs', (req, res) => {
  const { email, uid, text, part } = req.query
  const to = emailRegex.test(email) ? email : 'amit@yieldx.biz'
  console.log(part)
  if (!req.body) res.send('error: no content sent')
  else if (part === undefined || isNaN(part))
    res.send('error: no part specified')
  else {
    if (Number(part) < -1) res.send('error: bad part')
    if (Number(part) > -1) {
      currentText[part] = req.body
      res.send(`ok: attached part ${part}`)
    }
    if (Number(part) === -1)
      transporter
        .sendMail({
          from: 'yieldx.dev@gmail.com',
          to,
          subject:
            'RedMite Log: ' + (text ? text : '') + ' ' + (uid ? uid : ''),
          attachments: [
            {
              filename: `redmite_log_${uid ? uid + '_' : ''}${Date.now()}.txt`,
              content: [...currentText, req.body].join(''),
            },
          ],
        })
        .then((result) => {
          res.send(`ok: sent log to ${to}`)
          currentText = []
          console.log('Mail sent:', result.response)
        })
        .catch((err) => {
          res.send('error: ' + err.message)
          console.log(err.message)
        })
  }
})

app.listen(process.env.PORT, () => {
  console.log('Server Running on PORT', process.env.PORT)
})
