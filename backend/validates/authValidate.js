import Joi from 'joi'

const schemaLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

function login(req, res, next) {
    const { error } = schemaLogin.validate(req.body)
    if (error) return res.status(400).json({ message: error.details[0].message, })
    next();
}

export default { login };
