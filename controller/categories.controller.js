const { categoriesService, vendorsService } = require("../service");
const { generateRandomNumber } = require("../utils/helpers");
const { successResponse, errorResponse } = require("../utils/responder");
const constant = require("../utils/constant");

exports.createCategories = async (req, res, next) => {
  try {
    const vendor = await vendorsService.getVendors({ creatorId: req.userId });
    const data = await categoriesService.createCategories({
      ...req.body,
      vendorId: vendor.docs[0]._id,
      slug:
        req.body.title?.replace(/[" "]/gi, "-") + "-" + generateRandomNumber(5),
    });
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.updateCategories = async (req, res, next) => {
  try {
    var updateObj = {};
    Object.keys(req.body).forEach((key) => {
      if (req.body[key]) {
        updateObj[key] = req.body[key];
      }
    });
    const vendor = await vendorsService.getVendors({ creatorId: req.userId });
    const data = await categoriesService.updateCategories(
      { _id: updateObj._id, vendorId: vendor.docs[0]._id },
      updateObj
    );
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getCategories = async (req, res, next) => {
  try { 
    const query =  req.query || {}
    const data = await categoriesService.getCategories(query);
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await categoriesService.deleteCategory(id);
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await categoriesService.getCategoryById(id);
    if (!data) {
      return errorResponse(res, null, constant.categoryNotFound);
    }
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.updateCategory = async (req, res, next) => {
    try {
        var updateObj = {};
        Object.keys(req.body).forEach((key) => {
            if (req.body[key]) {
                updateObj[key] = req.body[key];
            }
        });
        const vendor = await vendorsService.getVendors({ creatorId: req.userId });
        const data = await categoriesService.updateCategories(
            { _id: req.params.id, vendorId: vendor.docs[0]._id },
            updateObj
        );
        successResponse(res, data);
    } catch (error) {
        errorResponse(res, error);
    }
}