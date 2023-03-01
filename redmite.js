const got = require('got')
const mqtt = require('mqtt')
const EventLogger = require('node-windows').EventLogger

const log = new EventLogger('Redmite_viv')

const config = { clean: true, secure: false }
const client = mqtt.connect('mqtt://broker.mqttdashboard.com:1883', config)

client.on('connect', () => {
  log.info('Connected')
  console.log('Connected')
  client.subscribe(['RedMite_viv/#'])
})

client.on('message', (topic, payload) => {
  if (payload.toString()) {
    log.info(`Received Message: ${topic} ${payload.toString()}`)
    console.log(`Received Message: ${topic} ${payload.toString()}`)

    try {
      const json = JSON.parse(payload.toString())
      got
        .post('https://compass.test.intelia.com/api/v1/device/sensors/data', {
          headers: { api_authorization: '6ff40fa38a5d44e8b706c964747df253' },
          json,
        })
        .json()
        .then((res) => {
          log.info(JSON.stringify(res))
          console.log(res)
          client.publish(topic, null, { retain: true })
        })
        .catch((e) => {
          log.error(`Server returned error: ${e}`)
          console.log(`Server returned error: ${e}`)
        })
    } catch {
      log.warn('Not a valid message')
      console.log('Not a valid message')
    }
  }
})
