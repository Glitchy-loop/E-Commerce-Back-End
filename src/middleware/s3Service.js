const { S3 } = require('aws-sdk')
const { bucketName } = require('../config')

exports.s3Upload = async file => {
  const s3 = new S3()

  const param = {
    Bucket: bucketName,
    Key: `images/${new Date().getTime()}`,
    Body: file.buffer
  }

  return await s3.upload(param).promise()
}
