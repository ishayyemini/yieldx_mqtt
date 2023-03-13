const sql = require('mssql')

const get_report_data = ({ username, UID }, write, end) => {
  if (username === 'all') username = ''
  console.log(`Fetching data of test number ${UID}`)

  console.time('Total time')
  const config = {
    user: 'sa',
    password: 'Yieldxbiz2021',
    server: 'localhost',
    database: 'SensorsN',
    options: { encrypt: false },
  }
  sql.connect(config).then(async () => {
    const request = new sql.Request()
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
    let fetchedAlready = 0

    console.log(`Found ${row_count} rows`)
    write(row_count.toString())
    request.stream = true

    request.query(
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

    process.stdout.write(
      `Fetched ${fetchedAlready} out of ${row_count} (${Math.round(
        (fetchedAlready / row_count) * 100
      )}%)`
    )

    const updateStatus = () => {
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(
        `Fetched ${fetchedAlready} out of ${row_count} (${Math.round(
          (fetchedAlready / row_count) * 100
        )}%)`
      )
    }

    let firstRow = true
    request.on('row', (row) => {
      write((firstRow ? '[' : ',') + JSON.stringify(row))
      if (firstRow) firstRow = false
      fetchedAlready++
      if (fetchedAlready % 100 === 0) updateStatus()
    })

    request.on('done', () => {
      write(']')
      updateStatus()
      sql.close()
      console.log()
      console.timeEnd('Total time')
      end()
    })
  })

  sql.on('error', (err) => {
    console.log(err)
  })
}

module.exports.default = get_report_data
