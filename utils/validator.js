const Validator = require('validatorjs');
const validate = async (req, res, next, validationRule) => {
    const validation = new Validator(req.body, validationRule, {});
    validation.passes(() => next());
    validation.fails(() => {
        var newErrorArr = []
        for (const key in validation.errors.errors) {
            newErrorArr.push(validation.errors.errors[key][0])
        }
        res.status(412)
            .send({
                success: false,
                message: 'Validation failed',
                errors: newErrorArr,
            })

    })
}

exports.signupInputValidator = async (req, res, next) => {
    const validationRule = {
        "firstName": "required|string",
        "lastName": "required|string",
        "email": "required|string|email",
        "password": "required|string|min:5",
    };
    validate(req, res, next, validationRule)
}

exports.signinInputValidator = async (req, res, next) => {
    const validationRule = {
        "email": "required|string|email",
        "password": "required|string|min:6",
    };
    validate(req, res, next, validationRule)
}

exports.updateValidator = async (req, res, next) => {
    const validationRule = {
        "_id": "required|string",
    };
    validate(req, res, next, validationRule)
}

exports.productCreationValidator = async (req, res, next) => {
    const validationRule = {
        "title": "required|string",
        "original_price": "required|numeric",
        "discounted_price": "required|numeric",
        "description": "required|string",
        "images": "required|array",
        "vendorId": "required|string",
        "categoryId": "required|string",
    };
    validate(req, res, next, validationRule)
}

exports.categoryCreationValidator = async (req, res, next) => {
    const validationRule = {
        "title": "required|string",
        "image": "required|url",
    };
    validate(req, res, next, validationRule)
}

exports.vendorsCreationValidator = async (req, res, next) => {
    const validationRule = {
        "title": "required|string",
        "image": "required|string",
        // "openingDays": "required|array", 
        "address": {
            "longitude": "required|string",
            "latitude": "required|string",
            "city": "required|string",
        }
    };
    validate(req, res, next, validationRule)
}


exports.addToCartValidator = async (req, res, next) => {
    const validationRule = {
        "productId": "required|string",
    };
    validate(req, res, next, validationRule)
}

exports.addToWishlistValidator = async (req, res, next) => {
    const validationRule = {
        "productId": "required|string",
    };
    validate(req, res, next, validationRule)
}
exports.updateCartValidator = async (req, res, next) => {
    const validationRule = {
        "cartId": "required|string",
        "qty": "required|numeric",
        "productId": "required|string"
    };
    validate(req, res, next, validationRule)
}

exports.addAddressValidator = async (req, res, next) => {
    const validationRule = {
        "name": "required|string",
        "street": "required|string",
        "city": "required|string",
        "state": "required|string",
        "phone": "required|string",
    };
    validate(req, res, next, validationRule)
}


exports.createOrdersValidator = async (req, res, next) => {
    const validationRule = {
        "amountPaid": "required|numeric",
        "deliveryAddress": {
            "phone": "required|string",
            "street": "required|string",
        }
    };
    validate(req, res, next, validationRule)
} 

exports.updateOrdersValidator = async (req, res, next) => {
    const validationRule = {
        "_id": "required|string",
        "flutterwave": {
            "transaction_id": "required|string",
            "tx_ref": "required|string",
        }
    };
    validate(req, res, next, validationRule)
} 