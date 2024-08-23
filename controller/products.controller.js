const { productsService } = require("../service")
const { generateRandomNumber, groupByOr, buildFilterQuery, s3Bucket, s3 } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")
const fs = require("fs");

exports.createProducts = async (req, res, next) => {
    try {
console.log(req.body)
        const data = await productsService.createProducts({
            ...req.body, slug: req.body.title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)
        })
        
        successResponse(res, data)
    } catch (error) {
        console.log(error)
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
        var q = decodeURIComponent(req.query).toString()
        console.log(q)
        const query = buildFilterQuery(q);
        console.log(JSON.stringify(query),limit)
        sort = sort == 'highToLow' ? { sort: { original_price: -1 } } : sort == 'lowToHigh' ? { sort: { rating: -1 } } : {};
        const options = {
            ...sort,
            ...pagination
        };
        const data = await productsService.getProducts({ query: { ...query, archive: false }, options })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}

exports.uploadImages = async (req, res, next) => {
    try {
         // Handle image uploads
    const images = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
 
        // Save each file and add the file path or URL to images array
        for (const key in files) {
            const fileContent = fs.readFileSync(files[key].tempFilePath);
         s3.upload({
                Bucket: s3Bucket,
                Key: "images/" + files[key].name,
                ACL: "public-read",
                Body: fileContent,
                ContentType: files[key].mimetype
            }).promise().then((result)=>{
            images.push(result.Location)
            if (files.length - 1 ==  key) successResponse(res, {images})
    })
        }
    } 
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
