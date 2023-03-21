const sql = require('mssql')

const get_report_data = async ({ username, UID }, res) => {
  if (username === 'all') username = ''
  const request = new sql.Request()

  // Send row count to end user
  const [{ row_count }] = await request
    .query(
      `
SELECT Count(*) as row_count 
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
  console.log(`Found ${row_count} rows`)
  res.write(row_count.toString())
  res.flush()

  const rows = await request
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

  res.write(JSON.stringify(rows))
  res.end()
}

module.exports = get_report_data
