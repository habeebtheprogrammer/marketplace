const mongoose = require('mongoose');
const Users = require('../model/users.model');
const Orders = require('../model/orders.model');
const Products = require('../model/products.model');
const Transactions = require('../model/transactions.model');
const Wallets = require('../model/wallets.model');
const ChatSessions = require('../model/whatsappChatSessions.model');

const toObjectId = (id) => {
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch (err) {
    return null;
  }
};

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const minus7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const minus30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      dailyActiveUsers,
      monthlyActiveUsers,
      newUsersToday,
      ordersTodayAgg,
      ordersAllAgg,
      orderStatusAgg,
      topProductsAgg,
      lowStockProducts,
      walletSummary,
      failedTransactions,
      couponUsage,
      locationSegments,
    ] = await Promise.all([
      Users.countDocuments({ archive: { $ne: true } }),
      Users.countDocuments({ updatedAt: { $gte: startOfToday }, archive: { $ne: true } }),
      Users.countDocuments({ updatedAt: { $gte: minus30 }, archive: { $ne: true } }),
      Users.countDocuments({ createdAt: { $gte: startOfToday }, archive: { $ne: true } }),
      Orders.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$amountPaid' } } },
      ]),
      Orders.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$amountPaid' } } },
      ]),
      Orders.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Orders.aggregate([
        { $unwind: '$orderedProducts' },
        {
          $group: {
            _id: '$orderedProducts.productId',
            totalSales: { $sum: { $multiply: ['$orderedProducts.price', '$orderedProducts.qty'] } },
            quantity: { $sum: '$orderedProducts.qty' },
          },
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      ]),
      Products.find({ archive: { $ne: true }, is_stock: { $lte: 5 } })
        .select('title is_stock discounted_price original_price slug')
        .sort({ is_stock: 1 })
        .limit(5)
        .lean(),
      Transactions.aggregate([
        { $match: { status: 'successful', createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transactions.countDocuments({ status: 'failed', createdAt: { $gte: minus7 } }),
      Transactions.aggregate([
        { $match: { couponUsed: { $nin: [null, ''] } } },
        { $group: { _id: '$couponUsed', uses: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { uses: -1 } },
        { $limit: 10 },
      ]),
      Users.aggregate([
        {
          $group: {
            _id: {
              city: '$location.city',
              platform: '$location.platform',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const orderToday = ordersTodayAgg?.[0] || { totalOrders: 0, totalRevenue: 0 };
    const orderSummary = ordersAllAgg?.[0] || { totalOrders: 0, totalRevenue: 0 };

    const averageOrderValue = orderSummary.totalOrders
      ? orderSummary.totalRevenue / orderSummary.totalOrders
      : 0;

    const walletTopUps = walletSummary.find((item) => item._id === 'credit');
    const walletPurchases = walletSummary.find((item) => item._id === 'debit');

    const topProducts = topProductsAgg.map((item) => ({
      id: item._id,
      name: item.product?.title || 'Unknown product',
      category: item.category?.title || 'Uncategorised',
      totalSales: item.totalSales,
      units: item.quantity,
      slug: item.product?.slug,
    }));

    const statusDistribution = orderStatusAgg.map((item) => ({
      name: formatOrderStatus(item._id),
      value: item.count,
    }));

    const retention = await computeRetention();

    res.json({
      meta: {
        generatedAt: now,
      },
      northStar: [
        {
          id: 'daily-active-users',
          title: 'Daily Active Users',
          value: dailyActiveUsers.toLocaleString(),
          change: computePercentageChange(dailyActiveUsers, monthlyActiveUsers / 30 || 0),
          trendLabel: 'vs 30-day avg',
          sparkline: buildSparkline(dailyActiveUsers),
        },
        {
          id: 'new-users',
          title: 'New Users Today',
          value: newUsersToday.toLocaleString(),
          change: computePercentageChange(newUsersToday, totalUsers / 30 || 0),
          trendLabel: 'vs avg',
          sparkline: buildSparkline(newUsersToday),
        },
        {
          id: 'revenue-today',
          title: 'Revenue Today',
          prefix: '₦',
          value: formatCurrency(orderToday.totalRevenue),
          change: computePercentageChange(orderToday.totalRevenue, orderSummary.totalRevenue / Math.max(orderSummary.totalOrders, 1)),
          trendLabel: 'vs avg order',
          sparkline: buildSparkline(orderToday.totalRevenue),
        },
        {
          id: 'orders-today',
          title: 'Orders Today',
          value: orderToday.totalOrders.toLocaleString(),
          change: computePercentageChange(orderToday.totalOrders, orderSummary.totalOrders / Math.max(orderSummary.totalOrders, 1)),
          trendLabel: 'vs avg',
          sparkline: buildSparkline(orderToday.totalOrders),
        },
      ],
      retention,
      totals: {
        totalUsers,
        dailyActiveUsers,
        monthlyActiveUsers,
        newUsersToday,
        revenueMonthToDate: orderSummary.totalRevenue,
        ordersMonthToDate: orderSummary.totalOrders,
        averageOrderValue,
        wallet: {
          topUps: walletTopUps?.totalAmount || 0,
          purchases: walletPurchases?.totalAmount || 0,
        },
        failedTransactions,
      },
      orderStatus: statusDistribution,
      topProducts,
      lowStock: lowStockProducts.map((product) => ({
        id: product._id,
        name: product.title,
        stock: product.is_stock,
        price: product.discounted_price || product.original_price,
        slug: product.slug,
      })),
      marketing: {
        couponUsage,
        locationSegments: locationSegments.map((segment) => ({
          city: segment._id.city || 'Unknown',
          platform: segment._id.platform || 'Unknown',
          count: segment.count,
        })),
      },
      orderOverview: {
        revenueToday: orderToday.totalRevenue,
        ordersToday: orderToday.totalOrders,
        gmvMonthToDate: orderSummary.totalRevenue,
        ordersMonthToDate: orderSummary.totalOrders,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error', error);
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = { archive: { $ne: true } };

    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
      ];
    }

    if (status) {
      if (status.toLowerCase() === 'active') query.banned = false;
      else if (status.toLowerCase() === 'blocked') query.banned = true;
    }

    const users = await Users.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { updatedAt: -1 },
      lean: true,
      select: 'firstName lastName email phoneNumber banned createdAt updatedAt',
    });

    const walletMap = await fetchWalletBalances(users.docs.map((doc) => doc._id));

    const items = users.docs.map((user) => ({
      id: user._id,
      fullName: `${capitalize(user.firstName)} ${capitalize(user.lastName)}`.trim(),
      email: user.email,
      lastActive: user.updatedAt,
      createdAt: user.createdAt,
      walletBalance: walletMap.get(String(user._id)) || 0,
      status: user.banned ? 'Blocked' : 'Active',
      phone: user.phoneNumber?.[0] || null,
    }));

    res.json({
      items,
      pagination: {
        total: users.totalDocs,
        page: users.page,
        totalPages: users.totalPages,
        limit: users.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId, reference } = req.query;
    const query = {};
    if (status) {
      const statusMap = {
        pending: ['awaiting payment', 'new order'],
        completed: ['delivered', 'completed'],
        cancelled: ['cancelled'],
        refunded: ['refunded'],
        'in transit': ['in transit'],
      };
      const statuses = statusMap[status.toLowerCase?.()] || [status];
      query.status = { $in: statuses };
    }
    if (userId) {
      const objectId = toObjectId(userId);
      if (objectId) query.userId = objectId;
    }
    if (reference) {
      query.trackingId = { $regex: new RegExp(reference, 'i') };
    }

    const orders = await Orders.paginate(query, {
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      lean: true,
    });

    const userIds = orders.docs.map((order) => order.userId);
    const users = await Users.find({ _id: { $in: userIds } })
      .lean()
      .select('firstName lastName email');
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const items = orders.docs.map((order) => ({
      id: order._id,
      reference: order.trackingId,
      userId: order.userId,
      customer: formatUser(userMap.get(String(order.userId))),
      total: order.amountPaid,
      status: formatOrderStatus(order.status),
      createdAt: order.createdAt,
      products: order.orderedProducts?.length || 0,
    }));

    res.json({
      items,
      pagination: {
        total: orders.totalDocs,
        page: orders.page,
        totalPages: orders.totalPages,
        limit: orders.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, categoryId, lowStock, search } = req.query;
    const query = { archive: { $ne: true } };
    if (categoryId) {
      const objectId = toObjectId(categoryId);
      if (objectId) query.categoryId = objectId;
    }
    if (lowStock === 'true') {
      query.is_stock = { $lte: 5 };
    }
    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { slug: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const products = await Products.paginate(query, {
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 10, 100),
      sort: { updatedAt: -1 },
      lean: true,
      populate: [{ path: 'categoryId', select: 'title' }],
      select: 'title categoryId discounted_price original_price is_stock views slug',
    });

    const items = products.docs.map((product) => ({
      id: product._id,
      name: product.title,
      category: product.categoryId?.title || 'N/A',
      price: product.discounted_price || product.original_price,
      stock: product.is_stock,
      views: product.views,
      slug: product.slug,
    }));

    res.json({
      items,
      pagination: {
        total: products.totalDocs,
        page: products.page,
        totalPages: products.totalPages,
        limit: products.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getWalletActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const baseMatch = buildWalletMatch(req.query);

    const listMatch = { ...baseMatch };
    if (!listMatch.status) listMatch.status = 'successful';

    const transactions = await Transactions.paginate(listMatch, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      lean: true,
      select: 'userId amount type status narration createdAt reference dataAmount',
    });

    const users = await Users.find({ _id: { $in: transactions.docs.map((tx) => tx.userId) } })
      .lean()
      .select('firstName lastName email');
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const items = transactions.docs.map((tx) => ({
      id: tx._id,
      user: formatUser(userMap.get(String(tx.userId))),
      amount: tx.amount,
      type: tx.type === 'credit' ? 'Top-up' : 'Purchase',
      status: tx.status === 'successful' ? 'Success' : tx.status === 'pending' ? 'Pending' : 'Failed',
      narration: tx.narration,
      createdAt: tx.createdAt,
      reference: tx.reference,
    }));

    const successMatch = { ...baseMatch, status: 'successful' };
    const failedMatch = { ...baseMatch, status: 'failed' };

    const totalsAgg = await Transactions.aggregate([
      { $match: successMatch },
      {
        $group: {
          _id: null,
          airtime: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$reference', ''] },
                    regex: /airtime/i,
                  },
                },
                '$amount',
                0,
              ],
            },
          },
          data: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$reference', ''] },
                    regex: /data|sme|bundle|gb|mb/i,
                  },
                },
                { $divide: [{ $ifNull: ['$dataAmount', 0] }, 1024] },
                0,
              ],
            },
          },
          deposit: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$narration', ''] },
                    regex: /wallet funding/i,
                  },
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todayAgg = await Transactions.aggregate([
      {
        $match: {
          ...successMatch,
          createdAt: { $gte: startOfToday, $lt: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          airtime: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$reference', ''] },
                    regex: /airtime/i,
                  },
                },
                '$amount',
                0,
              ],
            },
          },
          data: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$reference', ''] },
                    regex: /data|sme|bundle|gb|mb/i,
                  },
                },
                { $divide: [{ $ifNull: ['$dataAmount', 0] }, 1024] },
                0,
              ],
            },
          },
          deposit: {
            $sum: {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ['$narration', ''] },
                    regex: /wallet funding/i,
                  },
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    const failedAgg = await Transactions.aggregate([
      { $match: failedMatch },
      { $group: { _id: null, value: { $sum: '$amount' } } },
    ]);
    const todayFailedAgg = await Transactions.aggregate([
      {
        $match: {
          ...failedMatch,
          createdAt: { $gte: startOfToday, $lt: endOfToday },
        },
      },
      { $group: { _id: null, value: { $sum: '$amount' } } },
    ]);

    const totals = totalsAgg[0] || { airtime: 0, data: 0, deposit: 0 };
    const todayTotals = todayAgg[0] || { airtime: 0, data: 0, deposit: 0 };
    totals.failed = failedAgg[0]?.value || 0;
    todayTotals.failed = todayFailedAgg[0]?.value || 0;

    res.json({
      items,
      pagination: {
        total: transactions.totalDocs,
        page: transactions.page,
        totalPages: transactions.totalPages,
        limit: transactions.limit,
      },
      totals,
      todayTotals,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMarketingInsights = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const [sourceBreakdown, couponUsage, newUsers] = await Promise.all([
      Transactions.aggregate([
        { $match: { ...match, status: 'successful' } },
        { $group: { _id: '$source', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { revenue: -1 } },
      ]),
      Transactions.aggregate([
        { $match: { ...match, couponUsed: { $nin: [null, ''] }, status: 'successful' } },
        { $group: { _id: '$couponUsed', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Users.countDocuments({ ...match, archive: { $ne: true } }),
    ]);

    res.json({
      acquisition: sourceBreakdown.map((item) => ({
        channel: item._id || 'unknown',
        count: item.count,
        revenue: item.revenue,
      })),
      couponUsage,
      newUsers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const [lowStock, failedTransactions, pendingRefunds] = await Promise.all([
      Products.find({ archive: { $ne: true }, is_stock: { $lte: 5 } })
        .select('title is_stock slug')
        .limit(5)
        .lean(),
      Transactions.find({ status: 'failed', createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        .select('reference amount narration createdAt')
        .lean(),
      Transactions.find({ narration: /refund/i, status: 'pending' })
        .select('reference amount createdAt')
        .lean(),
    ]);

    const alerts = [];

    lowStock.forEach((product) => {
      alerts.push({
        id: `low-stock-${product._id}`,
        severity: 'warning',
        title: `${product.title} has only ${product.is_stock} units left`,
        timestamp: new Date(),
      });
    });

    failedTransactions.forEach((tx) => {
      alerts.push({
        id: `failed-tx-${tx._id}`,
        severity: 'danger',
        title: `Payment ${tx.reference} failed for ₦${tx.amount.toLocaleString()}`,
        timestamp: tx.createdAt,
      });
    });

    pendingRefunds.forEach((tx) => {
      alerts.push({
        id: `refund-${tx._id}`,
        severity: 'info',
        title: `Refund pending for ${tx.reference} (₦${tx.amount.toLocaleString()})`,
        timestamp: tx.createdAt,
      });
    });

    res.json({ items: alerts });
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const conversationQuery = {};
    if (search) {
      conversationQuery.$or = [
        { waId: { $regex: new RegExp(search, 'i') } },
        { 'messages.content': { $regex: new RegExp(search, 'i') } },
      ];
    }

    const sessions = await ChatSessions.paginate(
      conversationQuery,
      {
        page: Number(page) || 1,
        limit: Math.min(Number(limit) || 10, 50),
        sort: { updatedAt: -1 },
        select: 'waId userId updatedAt messages',
        lean: true,
      }
    );

    const userIds = sessions.docs.map((session) => session.userId).filter(Boolean);
    const users = await Users.find({ _id: { $in: userIds } })
      .lean()
      .select('firstName lastName email phoneNumber');
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const items = sessions.docs.map((session) => {
      const lastMessage = session.messages?.[session.messages.length - 1];
      const user = userMap.get(String(session.userId));
      const messages = (session.messages || []).slice(-50); // last 50 messages for context
      return {
        id: session._id,
        user: formatUser(user) || session.waId,
        waId: session.waId,
        userId: session.userId,
        lastMessage: lastMessage?.content,
        lastMessageRole: lastMessage?.role,
        updatedAt: session.updatedAt,
        totalMessages: session.messages?.length || 0,
        messages,
      };
    });

    res.json({
      items,
      pagination: {
        total: sessions.totalDocs,
        page: sessions.page,
        totalPages: sessions.totalPages,
        limit: sessions.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

async function fetchWalletBalances(userIds = []) {
  if (!userIds.length) return new Map();
  const wallets = await Wallets.find({ userId: { $in: userIds } })
    .select('userId balance')
    .lean();
  return new Map(wallets.map((wallet) => [String(wallet.userId), wallet.balance]));
}

function formatUser(user) {
  if (!user) return null;
  const name = [user.firstName, user.lastName]
    .filter(Boolean)
    .map(capitalize)
    .join(' ');
  return name || user.email || 'Unknown user';
}

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatOrderStatus(status) {
  if (!status) return 'Pending';
  const map = {
    'awaiting payment': 'Pending',
    'new order': 'Pending',
    delivered: 'Completed',
    cancelled: 'Cancelled',
    'in transit': 'In transit',
    pending: 'Pending',
    completed: 'Completed',
    refunded: 'Refunded',
  };
  return map[status.toLowerCase?.() || status] || capitalize(status);
}

function computePercentageChange(current, previous) {
  if (!previous) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function buildSparkline(value) {
  const base = value || 0;
  return [
    { label: 'Mon', value: Math.max(base * 0.6, 0) },
    { label: 'Tue', value: Math.max(base * 0.7, 0) },
    { label: 'Wed', value: Math.max(base * 0.8, 0) },
    { label: 'Thu', value: Math.max(base * 0.9, 0) },
    { label: 'Fri', value: base },
  ];
}

function formatCurrency(value = 0) {
  return Number(value).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

async function computeRetention() {
  const now = new Date();

  const day1 = await retentionForWindow(now, 1);
  const day7 = await retentionForWindow(now, 7);
  const day30 = await retentionForWindow(now, 30);

  return [
    { label: 'Day 1', value: day1 },
    { label: 'Day 7', value: day7 },
    { label: 'Day 30', value: day30 },
  ];
}

async function retentionForWindow(now, windowDays) {
  const cohortStart = new Date(now.getTime() - (windowDays + 1) * 24 * 60 * 60 * 1000);
  const cohortEnd = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const cohort = await Users.countDocuments({
    createdAt: { $gte: cohortStart, $lt: cohortEnd },
    archive: { $ne: true },
  });

  if (!cohort) return 0;

  const retained = await Users.countDocuments({
    createdAt: { $gte: cohortStart, $lt: cohortEnd },
    updatedAt: { $gte: new Date(cohortEnd.getTime()) },
    archive: { $ne: true },
  });

  return Math.round((retained / cohort) * 100);
}

function buildWalletMatch(query = {}) {
  const match = {};
  if (query.status && query.status !== 'all') match.status = query.status;
  if (query.type && query.type !== 'all') match.type = query.type;
  if (query.reference) match.reference = { $regex: new RegExp(query.reference, 'i') };
  if (query.narration) match.narration = { $regex: new RegExp(query.narration, 'i') };
  if (query.page) delete match.page;
  if (query.limit) delete match.limit;
  return match;
}
