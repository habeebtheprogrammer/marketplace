const Orders = require("../model/orders.model");

exports.getOrders = async (filters = {}) => {
  const data = await Orders.paginate(filters, {
    populate: [
      {
        path: "orderedProducts",
        populate: {
          path: "productId",
          select: ["title", "images"],
        },
      }
    ],
    sort: { _id: -1 },
  });
  return data;
};

exports.getAllOrders = async (page = 1, limit = 10) => {
  const data = await Orders.paginate(
    {},
    {
      populate: [
        {
          path: "orderedProducts",
          populate: {
            path: "productId",
            select: ["title", "images"],
          },
        },
        {
          path: "userId",
          select: ["firstName", "lastName", "email"],
        },
      ],
      sort: { _id: -1 },
      page,
      limit,
    }
  );
  return data;
};

exports.addOrders = async (param) => {
  console.log(param);
  const data = (await Orders.create(param)).populate({
    path: "orderedProducts",
    populate: {
      path: "productId",
      select: ["title", "images"],
    },
  });
  return data;
};

exports.updateOrders = async (params, obj) => {
  const data = await Orders.findOneAndUpdate(params, obj, { new: true });
  return data;
};
