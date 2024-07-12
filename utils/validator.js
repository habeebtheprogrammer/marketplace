const Validator = require('validatorjs');
const validate = async (req, res, next, validationRule) => {
    const validation = new Validator(req.body, validationRule, {});
    validation.passes(() =>  next());
    validation.fails(() => res.status(412)
    .send({
        success: false,
        message: 'Validation failed',
        data: validation.errors,
    }))
}

exports.signupValidator = async (req, res, next) => {
    const validationRule = {
        "firstName": "required|string",
        "lastName": "required|string",
        "email": "required|string|email",
        "password": "required|string|min:6",
    };
    validate(req, res, next, validationRule)
} 

exports.signinValidator = async (req, res, next) => {
    const validationRule = {
        "email": "required|string|email",
        "password": "required|string|min:6",
    };
    validate(req, res, next, validationRule)
} 