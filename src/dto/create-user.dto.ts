import * as Joi from 'joi';

export const CreateUserSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } }).required(),
  password: Joi.string().min(8).required(),
  role:Joi.string().valid('USER','ADMIN').default('User'),
  status:Joi.string().valid('ACTIVE','INACTIVE').default('ACTIVE'),
});

export const UpdateUserSchema = Joi.object({
  firstName: Joi.string().min(3).optional(),
  lastName: Joi.string().min(3).optional(),
  email: Joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } }).optional(),
  password: Joi.string().min(8).optional(),
 
});

export const LoginUserSchema=Joi.object({
  email: Joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } }).required(),
  password: Joi.string().min(8).required(),
})

export const ChangePasswordSchema=Joi.object({
  oldPassword: Joi.string().min(8).required(),
  newPassword:Joi.string().min(8).required(),
  confirmPassword:Joi.string().valid(Joi.ref('newPassword')).required()
})