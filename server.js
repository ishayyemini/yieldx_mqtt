const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')

const tokens = require('./tokens.json')

const app = express()

app.use(cors())
app.use(express.text({ limit: '10mb' }))

const emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'yieldx.dev@gmail.com', pass: tokens.GMAIL_PASSWORD },
})

app.get('/test', (req, res) => {
  res.send('test ok!')
})

app.get('/', (req, res) => {
  res.send('welcome to the backend (:')
})

const currentText = {}

app.post('/email-logs', (req, res) => {
  const { email, uid, text, ext, part } = req.query
  const to = emailRegex.test(email) ? email : 'amit@yieldx.biz'
  if (!req.body) res.send('error: no content sent')
  else if (part === undefined || isNaN(part))
    res.send('error: no part specified')
  else if (!uid) res.send('error: no UID specified')
  else {
    if (Number(part) < -1) res.send('error: bad part')
    if (Number(part) > -1) {
      if (!currentText[`${uid}|${ext}`]) currentText[`${uid}|${ext}`] = []
      currentText[`${uid}|${ext}`][part] = req.body
      res.send(`ok: attached part ${part} of ${uid}|${ext}`)
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
              filename: `redmite_${
                ext?.slice(0, 3) || ''
              }_${uid}_${Date.now()}.txt`,
              content: [...(currentText[`${uid}|${ext}`] || []), req.body].join(
                ''
              ),
            },
          ],
        })
        .then((result) => {
          res.send(`ok: sent log to ${to}`)
          currentText[`${uid}|${ext}`] = []
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
