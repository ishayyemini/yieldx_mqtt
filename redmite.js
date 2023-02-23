const redmite = ({ body }, context, callback) => {
  console.log(body)
  const data = body?.data

  callback(null, { data, text: 'success' })
}

module.exports.default = redmite
