const Joi = require('joi')

const addProductSchema = Joi.object({
  img: Joi.any(),
  title: Joi.string().trim(),
  category: Joi.string(),
  price: Joi.number(),
  description: Joi.string()
})

module.exports = addProductSchema
