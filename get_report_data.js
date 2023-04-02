const sql = require('mssql')

const keysToAvg = [
  'AS_CO',
  'AS_NH3',
  'Pressure',
  'Relative Humidity',
  'Resistance Gassensor',
  'SHT41_ADP',
  'SHT41_HUM',
  'SHT41_Temp',
  'SPG41_ADP',
  'SPG41_nox',
  'SPG41_voc',
  'SPS30_ADP',
  'SPS30_mc1',
  'SPS30_mc2',
  'SPS30_mc3',
  'SPS30_mc4',
  'SPS30_mc5',
  'SPS30_mc6',
  'SPS30_mc7',
  'SPS30_mc8',
  'SPS30_mc9',
  'SPS30_mc10',
  'STC31_ADP',
  'STC31_CO2',
  'STC31_Temp',
  'Temperature',
]

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
  let parsedRows = []
  rows.forEach((item, index) => {
    const interval = 50
    if (index % interval === 0) parsedRows.push(item)
    else
      keysToAvg.forEach(
        (key) =>
          (parsedRows[Math.floor(index / interval)][key] =
            parsedRows[Math.floor(index / interval)][key] +
            item[key] / interval)
      )
  })

  res.write(JSON.stringify(parsedRows))
  res.end()
}

module.exports = get_report_data
