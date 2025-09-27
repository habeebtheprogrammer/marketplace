const Ambassador = require("../model/ambassador.model");

exports.getAmbassadors = async ({ query = {}, options = {} }) => {
  const data = await Ambassador.paginate(query, {
    sort: { _id: -1 },
    ...options,
  });
  return data;
};

exports.createAmbassador = async (payload) => {
  const data = await Ambassador.create(payload);
  return data;
};

exports.updateAmbassador = async (param, obj) => {
  const data = await Ambassador.findOneAndUpdate(param, obj, { new: true });
  return data;
};

exports.deleteAmbassador = async (id) => {
  const data = await Ambassador.findOneAndDelete({ _id: id });
  return data;
};
