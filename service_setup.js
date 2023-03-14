const Service = require('node-windows').Service

const svc = new Service({
  name: 'SQL_Server_JS',
  script: require('path').join(__dirname, 'server.js'),
})

svc.on('install', () => {
  svc.start()
})

svc.on('uninstall', () => {
  console.log('Uninstall complete.')
  console.log('The service exists: ', svc.exists)
})

svc.install()

// svc.uninstall()
