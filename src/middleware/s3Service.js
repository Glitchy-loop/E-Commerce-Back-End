const { S3 } = require('aws-sdk')

exports.s3Upload = async files => {
  const s3 = new S3()

  const params = files.map(file => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${`${new Date().getTime()}.jpg`}`,
      Body: file.buffer
    }
  })
  return await Promise.all(params.map(param => s3.upload(param).promise()))
}
