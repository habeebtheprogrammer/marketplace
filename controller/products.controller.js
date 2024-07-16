const { productsService } = require("../service")
const { generateRandomNumber } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createProducts = async (req, res, next) => {
    try {
        const data = await productsService.createProducts({ 
            ...req.body, slug: req.body.title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)})
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
        const data = await productsService.updateProducts({ _id : updateObj._id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.getProducts = async (req, res, next) => {
 
    try {
        var filter = {}
        Object.keys(req.query).forEach(key => {
            if(req.query[key] == "") return ;
                var lists =  req.query[key].split(",")
                .map(i =>{
                    var val = i
                    if(key == 'original_price'){
                      var arr =  i.split('--');
                        val = {"$gte":  parseInt(arr[0]), "$lte": parseInt(arr[1])}
                        console.log(val)
                    } else if(key == 'rating'){
                        val = {"$gte": i, "$lte": 5}
                    }
                  return  ({[key]: val})
                })
                    
    
                if(filter['$or']){
                    filter["$or"] = [...filter["$or"], ...lists]
                } else {
                    filter['$or'] =  lists
                }
        })
        console.log(JSON.stringify(filter))
        const data = await productsService.getProducts(filter)
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
