const { vendorsService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const helpers = require("../utils/helpers")

exports.createVendors = async (req, res, next) => {
    try {
        const { address, title } = req.body
        const data = await vendorsService.createVendors({
            ...req.body,
            creatorId: req.userId,
            loc: { coordinates: [address.longitude, address.latitude] },
            slug: title?.replace(/[" "]/gi, "-") + '-' + helpers.generateRandomNumber(5)
        })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getVendors = async (req, res, next) => {
    try {
        const filter = {}
        const data = await vendorsService.getVendors()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateVendorAccount = async (req, res, next) => {
    try {
        var updateObj = {}
        Object.keys(req.body).forEach(key => {
            if (req.body[key]) {
                updateObj[key] = req.body[key];
            }
        })
        const vendor = await vendorsService.getVendors({creatorId: req.userId})
        const data = await vendorsService.updateVendors({ _id: vendor.docs[0]._id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getVendorAccount = async (req, res, next) => {
    try {
        const filter = { creatorId: req.userId }
        const data = await vendorsService.getVendors(filter)
        successResponse(res, data.docs[0])
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateVendorById = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const updateObj = {};
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updateObj[key] = req.body[key];
            }
        });
        const data = await vendorsService.updateVendors({ _id: vendorId }, updateObj);
        if (!data) return errorResponse(res, { message: 'Vendor not found' });
        successResponse(res, data);
    } catch (error) {
        errorResponse(res, error);
    }
}

exports.getVendorById = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const data = await vendorsService.getVendors({ _id: vendorId });
        if (!data.docs || !data.docs.length) return errorResponse(res, { message: 'Vendor not found' });
        successResponse(res, data.docs[0]);
    } catch (error) {
        errorResponse(res, error);
    }
}