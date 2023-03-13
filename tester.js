const { decompress } = require('compress-json')
const getReportData = require('./get_report_data').default

let rowCount = undefined
let rows = []
getReportData(
  { UID: 268 },
  (chunk) => {
    if (!isNaN(chunk) && rowCount === undefined) {
      rowCount = chunk
    } else {
      rows = rows.concat(decompress(chunk))
      // console.log(`Got ${rows.length} of ${rowCount} rows`)
    }
  },
  (res) => {
    console.log('Done!')
    // console.timeEnd('Fetching')
  }
)
