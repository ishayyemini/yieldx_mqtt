const sql = require('mssql')
const { compress } = require('compress-json')

const get_report_data = ({ username, UID, noCompression }, writeChunk, end) => {
  if (username === 'all') username = ''
  console.log(`Fetching data of test number ${UID}`)

  console.time('Total time')
  const config = {
    user: 'sa',
    password: 'Yieldxbiz2021',
    server: '3.127.195.30',
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
    writeChunk(row_count)
    request.stream = true

    request
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
      .pipe()

    process.stdout.write(
      `Fetched ${fetchedAlready} out of ${row_count} (${Math.round(
        (fetchedAlready / row_count) * 100
      )}%)`
    )

    let rowsToProcess = []
    request.on('row', (row) => {
      rowsToProcess.push(row)
      if (rowsToProcess.length >= 1000) {
        request.pause()
        processRows()
      }
    })

    const processRows = () => {
      writeChunk(noCompression ? rowsToProcess : compress(rowsToProcess))
      fetchedAlready += rowsToProcess.length

      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(
        `Fetched ${fetchedAlready} out of ${row_count} (${Math.round(
          (fetchedAlready / row_count) * 100
        )}%)`
      )

      rowsToProcess = []
      request.resume()
    }

    request.on('done', () => {
      processRows()
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
