const { productsService } = require("../service")
const { generateRandomNumber, groupByOr, buildFilterQuery } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createProducts = async (req, res, next) => {
    try {
        const data = await productsService.createProducts({
            ...req.body, slug: req.body.title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)
        })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateProducts = async (req, res, next) => {
    try {
        var updateObj = {}
        Object.keys(req.body).forEach(key => {
            updateObj[key] = req.body[key];
        })
        const data = await productsService.updateProducts({ _id: updateObj._id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.getProducts = async (req, res, next) => {

    try {
        var filter = {}
        var { sort, limit = 9, page = 1 } = req.query

        var pagination = { limit, page }

        const query = buildFilterQuery(req.query);
        sort = sort == 'highToLow' ? { sort: {original_price: -1} } : sort == 'lowToHigh'  ? { sort: { rating: -1 }} : {};
        const options = {
            ...sort,
            ...pagination
        };
        const data = await productsService.getProducts({ query: {...query, archive: false}, options })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
