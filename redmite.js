import got from 'got'

const redmite = async ({ body }, context, callback) => {
  if (!body) throw new Error('No body provided')

  const { res } = await got
    .post('https://compass.test.intelia.com/api/v1/device/sensors/data', {
      headers: { api_authorization: '6ff40fa38a5d44e8b706c964747df253' },
      json: body,
    })
    .json()

  console.log(res)

  callback(null, { res, text: 'success' })
}

export default redmite

// redmite(
//   {
//     body: {
//       sensors: [
//         {
//           sensor_tag_name: 'RedMite',
//           unit_id: 1,
//           data: [
//             {
//               sensor_timestamp: Date.now(),
//               sensor_index: 1,
//               value: 1,
//             },
//           ],
//         },
//       ],
//     },
//   },
//   null,
//   (e, r) => {
//     console.log(r)
//   }
// )
