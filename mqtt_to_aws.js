const mqtt = require('mqtt')
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' })
const config = { clean: true, secure: false }
const client = mqtt.connect('mqtt://3.127.195.30:1883', config)

client.on('connect', () => {
  console.log('Connected')
  client.subscribe(['RedMite/#'])
})

client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())

  const ddb = new AWS.DynamoDB.DocumentClient()

  const uid = topic.split('/')[1]

  const params = {
    TableName: 'redmite',
    Item: { uid, status: payload.toString() },
  }
  ddb.put(params, function (err, data) {
    if (err) {
      console.log('Error', err)
    } else {
      console.log('Success', data)
    }
  })
})
