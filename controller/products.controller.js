const { productsService } = require("../service")
const { generateRandomNumber, groupByOr, buildFilterQuery, s3Bucket, s3 } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")
const fs = require("fs");

exports.createProducts = async (req, res, next) => {
    try {
        const data = await productsService.createProducts({
            ...req.body, slug: req.body.title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)
        })
        
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
exports.createComments = async (req, res, next) => {
    try {
        const data = await productsService.createComments({
            ...req.body, creatorId: req.userId,
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
        var { sort, limit = 9, page = 1 , title} = req.query

        var pagination = { limit, page }

        const query = buildFilterQuery(req.query);
        console.log(JSON.stringify(query),limit, sort)
        var searchSortObj  = title ? {score : { $meta: 'textScore' } } : {}


        sort = sort == 'highToLow' ? { sort: { ...searchSortObj,original_price: -1 } } : sort == 'lowToHigh' ? { sort: { ...searchSortObj,original_price: 1 } } : {sort: {...searchSortObj, rating: -1}};
       
       
        if(title) sort.sort.score = { $meta: 'textScore' } 
        const options = {
            ...sort,
            ...pagination
        };
        if(title) options.score = { $meta: 'textScore' } 
        console.log(options, query)

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

exports.bulkUpdate = async (req, res, next) => {
    try {
         // Handle image uploads
         const data = await productsService.bulkUpdate(
            { categoryId:  '6693a1b7eae4b1d9160fa213' }, // Exclude the specific ID
            { $inc: { discounted_price: 10000} } // Increment the price
            // { categoryId: { $ne: '65b14b7105f8b5c69b5ab4e3' } }, // Exclude the specific ID
            // { $inc: { discounted_price: 30000,  } } // Increment the price
        )
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
