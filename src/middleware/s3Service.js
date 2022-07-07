const { S3 } = require('aws-sdk')

exports.s3Upload = async files => {
  console.log('mama1')
  const s3 = new S3()
  console.log('mama2')
  const params = files.map(file => {
    console.log('mama3')
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${`${new Date().getTime()}.jpg`}`,
      Body: file.buffer
    }
  })
  return await Promise.all(params.map(param => s3.upload(param).promise()))
}
