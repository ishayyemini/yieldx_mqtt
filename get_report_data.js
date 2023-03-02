const sql = require('mssql')

const get_report_data = async ({ username, UID }) => {
  if (username === 'all') username = ''
  console.log(`Fetching data of test number ${UID}`)

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

  console.log(res?.length)
  return res
}

module.exports.default = get_report_data
