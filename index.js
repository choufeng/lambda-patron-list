const config = require('/opt/hwt/config')
const utils = require('/opt/hwt/utils')
const Send = require('/opt/hwt/send')
const R = require('ramda')
const AWS = require('aws-sdk')

let send = null
const orm = new AWS.DynamoDB.DocumentClient()
AWS.config.update({
  region: config.table.region
})

const handler = async (event, ctx, callback) => {
  send = new Send(callback)
  const t = R.prop('Authorization', event.headers)
  const token = utils.getToken(t)
  const checkTokenResult = utils.checkToken(token, config.secret.key)
  if (!checkTokenResult.result) {
    send.show403(checkTokenResult)
    return false
  }
  const uid = checkTokenResult.uid
  const row = await getAdmin(getParams(uid))
  if (isNotAdmin(row.Item.level)) {
    send.show403({ result: false, message: '没有操作权限' })
    return false
  }
  const list = await getData(getListParams())
  if (R.isEmpty(list.Items)) {
    send.show200({ result: true, data: [], message: '没有找到任何数据' })
  }
  send.show200({ result: true, message: '', data: list.Items, count: list.Count})
}

const getListParams = () => {
  return {
    TableName: config.table.tableName,
    KeyConditionExpression: "#tb = :tb",
    ExpressionAttributeNames:{
        "#tb": "tb"
    },
    ExpressionAttributeValues: {
        ":tb": 'user'
    }
  }
}

const getParams = (id) => {
  return {
    TableName: config.table.tableName,
    Key: {
      tb: 'user',
      id: id
    }
  }
}

const getData = (d) => {
  return new Promise((resolve, reject) => {
    orm.query(d, function (err, data) {
      if (err) reject(err)
      resolve(data)
    })
  })
}

const getAdmin = (d) => {
  return new Promise((resolve, reject) => {
    orm.get(d, function (err, data) {
      if (err) reject(err)
      resolve(data)
    })
  })
}

const isNotAdmin = (d) => {
  return R.not(R.equals('admin', d))
}

module.exports = {
  handler
}
