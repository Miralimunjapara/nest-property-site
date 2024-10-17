import * as Joi from 'joi';

export const propertySchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipcode: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('sell', 'rent').required(),
    area: Joi.number().required(),
    rooms: Joi.number().integer().required(),
    contactNo:Joi.string().length(10).pattern(/^[0-9]{10}$/).required(),
    proTypeId: Joi.string().required(),
    userId:Joi.string(),
    status: Joi.number().valid(0, 1).default(1),
   
  });