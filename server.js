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

app.post('/email-logs', (req, res) => {
  const content = req.body
  const { email, uid } = req.query
  const to = emailRegex.test(email) ? email : 'amit@yieldx.biz'
  if (!content) res.send('error: no content sent')
  else
    transporter
      .sendMail({
        from: 'yieldx.dev@gmail.com',
        to,
        subject: 'RedMite Log ' + (uid ? uid : ''),
        attachments: [
          {
            filename: `redmite_log_${uid ? uid + '_' : ''}${Date.now()}.txt`,
            content,
          },
        ],
      })
      .then((result) => {
        res.send(`ok: sent log to ${to}`)
        console.log('Mail sent:', result.response)
      })
      .catch((err) => {
        res.send('error: ' + err.message)
        console.log(err.message)
      })
})

app.listen(process.env.PORT, () => {
  console.log('Server Running on PORT', process.env.PORT)
})
