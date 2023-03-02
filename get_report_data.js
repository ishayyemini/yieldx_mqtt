const sql = require('mssql')
const { compress } = require('compress-json')

const get_report_data = async ({ username, UID }) => {
  if (username === 'all') username = ''
  console.log(`Fetching data of test number ${UID}`)

  console.time('Fetching from SQL')
  const config = {
    user: 'sa',
    password: 'Yieldxbiz2021',
    server: 'localhost',
    database: 'SensorsN',
    options: { encrypt: false },
  }
  await sql.connect(config).catch((e) => console.log(e))

  const res = await new sql.Request()
    .query(
      `
SELECT * 
FROM SensorsData
WHERE dateCreated = (
  SELECT dateCreated
  FROM Locations
  WHERE UID = ${UID} 
  ${username ? `and Customer = '${username}'` : ''}
)
      `
    )
    .then((res) => res.recordset)
  console.timeEnd('Fetching from SQL')
  console.log(`Fetched ${res?.length} records`)

  console.time('Compressing')
  const beforeSize = Buffer.byteLength(JSON.stringify(res))
  console.log('Size before compression:', beforeSize)

  const compressed = compress(res)
  const afterSize = Buffer.byteLength(JSON.stringify(compressed))
  console.log('Size after compression:', afterSize)
  console.timeEnd('Compressing')

  return compressed
}

module.exports.default = get_report_data
