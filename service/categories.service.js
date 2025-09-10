const Categories = require("../model/categories.model");

exports.getCategories = async (filters = {}, options = {}) => {
  const data = await Categories.paginate(filters, options);
  return data;
};

exports.createCategories = async (param) => {
  const data = await Categories.create(param);
  return data;
};

exports.updateCategories = async (param, obj) => {
  const data = await Categories.findOneAndUpdate(param, obj, { new: true });
  return data;
};

exports.deleteCategory = async (id) => {
  const data = await Categories.findByIdAndUpdate(id, {archive: true});
  return data;
};

exports.getCategoryById = async (id) => {
  const data = await Categories.findById(id);
  return data;
};
