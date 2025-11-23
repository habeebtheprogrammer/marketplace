const mongoose = require('mongoose');
const Users = require('../model/users.model');
const Orders = require('../model/orders.model');
const Products = require('../model/products.model');
const Transactions = require('../model/transactions.model');
const Wallets = require('../model/wallets.model');
const ChatSessions = require('../model/whatsappChatSessions.model');
const Categories = require('../model/categories.model');
const Vendors = require('../model/vendors.model');
const Coupons = require('../model/coupons.model');
const Blogposts = require('../model/blogposts.model');
const Requests = require('../model/requests.model');
const Ambassador = require('../model/ambassador.model');
const Delivery = require('../model/delivery.model');
const Swap = require('../model/swap.model');
const UserJourney = require('../model/userJourney.model');
const AppliedCoupon = require('../model/appliedCoupons.model');

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
    const dayInMs = 24 * 60 * 60 * 1000;
    const { startDate: startDateParam, endDate: endDateParam } = req.query;

    const defaultRangeEnd = new Date(now);
    const defaultRangeStart = new Date(now.getTime() - 30 * dayInMs);
    defaultRangeStart.setHours(0, 0, 0, 0);
    defaultRangeEnd.setHours(23, 59, 59, 999);

    let rangeStart = startDateParam ? new Date(startDateParam) : defaultRangeStart;
    let rangeEnd = endDateParam ? new Date(endDateParam) : defaultRangeEnd;
    if (Number.isNaN(rangeStart.getTime())) rangeStart = defaultRangeStart;
    if (Number.isNaN(rangeEnd.getTime())) rangeEnd = defaultRangeEnd;
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    const rangeDuration = Math.max(rangeEnd - rangeStart, dayInMs);
    const previousRangeEnd = new Date(rangeStart.getTime() - 1);
    const previousRangeStart = new Date(previousRangeEnd.getTime() - rangeDuration);

    const [
      totalUsers,
      activeUsersRange,
      activeUsersPrevRange,
      newUsersRange,
      newUsersPrevRange,
      ordersRangeAgg,
      ordersPrevAgg,
      transactionStatusAgg,
      topProductsAgg,
      lowStockProducts,
      walletSummaryRange,
      failedTransactionsRange,
      couponUsage,
      locationSegments,
    ] = await Promise.all([
      Users.countDocuments({ archive: { $ne: true } }),
      Users.countDocuments({ updatedAt: { $gte: rangeStart, $lte: rangeEnd }, archive: { $ne: true } }),
      Users.countDocuments({ updatedAt: { $gte: previousRangeStart, $lte: previousRangeEnd }, archive: { $ne: true } }),
      Users.countDocuments({ createdAt: { $gte: rangeStart, $lte: rangeEnd }, archive: { $ne: true } }),
      Users.countDocuments({ createdAt: { $gte: previousRangeStart, $lte: previousRangeEnd }, archive: { $ne: true } }),
      Orders.aggregate([
        { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$amountPaid' } } },
      ]),
      Orders.aggregate([
        { $match: { createdAt: { $gte: previousRangeStart, $lte: previousRangeEnd } } },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$amountPaid' } } },
      ]),
      Transactions.aggregate([
        { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Products.find({
        archive: { $ne: true },
        updatedAt: { $gte: rangeStart, $lte: rangeEnd },
      })
        .select('title categoryId discounted_price original_price is_stock views slug updatedAt')
        .populate('categoryId', 'title')
        .sort({ views: -1 })
        .limit(8)
        .lean(),
      Products.find({ archive: { $ne: true }, is_stock: { $lte: 5 } })
        .select('title is_stock discounted_price original_price slug')
        .sort({ is_stock: 1 })
        .limit(5)
        .lean(),
      Transactions.aggregate([
        {
          $match: {
            status: 'successful',
            createdAt: { $gte: rangeStart, $lte: rangeEnd },
          },
        },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transactions.countDocuments({ status: 'failed', createdAt: { $gte: rangeStart, $lte: rangeEnd } }),
      Transactions.aggregate([
        {
          $match: {
            couponUsed: { $nin: [null, ''] },
            createdAt: { $gte: rangeStart, $lte: rangeEnd },
          },
        },
        { $group: { _id: '$couponUsed', uses: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { uses: -1 } },
        { $limit: 10 },
      ]),
      Users.aggregate([
        {
          $match: {
            createdAt: { $gte: rangeStart, $lte: rangeEnd },
          },
        },
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

    const ordersInRange = ordersRangeAgg?.[0] || { totalOrders: 0, totalRevenue: 0 };
    const ordersPrevRange = ordersPrevAgg?.[0] || { totalOrders: 0, totalRevenue: 0 };

    const averageOrderValue = ordersInRange.totalOrders
      ? ordersInRange.totalRevenue / ordersInRange.totalOrders
      : 0;

    const walletTopUps = walletSummaryRange.find((item) => item._id === 'credit');
    const walletPurchases = walletSummaryRange.find((item) => item._id === 'debit');

    const topProducts = topProductsAgg.map((product) => ({
      id: product._id,
      name: product.title,
      category: product.categoryId?.title || 'Uncategorised',
      price: product.discounted_price || product.original_price,
      stock: product.is_stock,
      views: product.views || 0,
      slug: product.slug,
    }));

    const statusDistribution = transactionStatusAgg.map((item) => ({
      name: formatTransactionStatus(item._id),
      value: item.count,
    }));

    const retention = await computeRetention();

    res.json({
      meta: {
        generatedAt: now,
        dateRange: {
          start: rangeStart,
          end: rangeEnd,
        },
      },
      northStar: [
        {
          id: 'daily-active-users',
          title: 'Active Users (range)',
          value: activeUsersRange.toLocaleString(),
          change: computePercentageChange(activeUsersRange, activeUsersPrevRange || 0),
          trendLabel: 'vs previous range',
          sparkline: buildSparkline(activeUsersRange),
        },
        {
          id: 'new-users',
          title: 'New Users',
          value: newUsersRange.toLocaleString(),
          change: computePercentageChange(newUsersRange, newUsersPrevRange || 0),
          trendLabel: 'vs previous range',
          sparkline: buildSparkline(newUsersRange),
        },
        {
          id: 'revenue-today',
          title: 'Revenue',
          prefix: '₦',
          value: formatCurrency(ordersInRange.totalRevenue),
          change: computePercentageChange(ordersInRange.totalRevenue, ordersPrevRange.totalRevenue || 0),
          trendLabel: 'vs previous range',
          sparkline: buildSparkline(ordersInRange.totalRevenue),
        },
        {
          id: 'orders-today',
          title: 'Orders',
          value: ordersInRange.totalOrders.toLocaleString(),
          change: computePercentageChange(ordersInRange.totalOrders, ordersPrevRange.totalOrders || 0),
          trendLabel: 'vs previous range',
          sparkline: buildSparkline(ordersInRange.totalOrders),
        },
      ],
      retention,
      totals: {
        totalUsers,
        dailyActiveUsers: activeUsersRange,
        monthlyActiveUsers: activeUsersPrevRange,
        newUsersToday: newUsersRange,
        revenueMonthToDate: ordersInRange.totalRevenue,
        ordersMonthToDate: ordersInRange.totalOrders,
        averageOrderValue,
        wallet: {
          topUps: walletTopUps?.totalAmount || 0,
          purchases: walletPurchases?.totalAmount || 0,
        },
        failedTransactions: failedTransactionsRange,
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
        revenueToday: ordersInRange.totalRevenue,
        ordersToday: ordersInRange.totalOrders,
        gmvMonthToDate: ordersInRange.totalRevenue,
        ordersMonthToDate: ordersInRange.totalOrders,
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

function formatTransactionStatus(status) {
  if (!status) return 'Pending';
  const map = {
    successful: 'Successful',
    success: 'Successful',
    failed: 'Failed',
    pending: 'Pending',
    processing: 'Pending',
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

// ==================== MANAGEMENT ENDPOINTS ====================

// Categories Management
exports.getCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, archive } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { slug: new RegExp(search, 'i') },
      ];
    }
    
    if (archive === 'true') query.archive = true;
    else if (archive === 'false') query.archive = false;
    else query.archive = { $ne: true };

    const categories = await Categories.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      populate: { path: 'vendorId', select: 'firstName lastName email' },
      lean: true,
    });

    res.json({
      items: categories.docs,
      pagination: {
        total: categories.totalDocs,
        page: categories.page,
        totalPages: categories.totalPages,
        limit: categories.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Categories.create(req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByIdAndUpdate(id, { archive: true }, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Vendors Management
exports.getVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, archive, available } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { slug: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.state': new RegExp(search, 'i') },
      ];
    }
    
    if (archive === 'true') query.archive = true;
    else if (archive === 'false') query.archive = false;
    else query.archive = { $ne: true };
    
    if (available !== undefined) query.available = available === 'true';

    const vendors = await Vendors.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      populate: { path: 'creatorId', select: 'firstName lastName email' },
      lean: true,
    });

    res.json({
      items: vendors.docs,
      pagination: {
        total: vendors.totalDocs,
        page: vendors.page,
        totalPages: vendors.totalPages,
        limit: vendors.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createVendor = async (req, res, next) => {
  try {
    const vendor = await Vendors.create(req.body);
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

exports.updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await Vendors.findByIdAndUpdate(id, req.body, { new: true });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await Vendors.findByIdAndUpdate(id, { archive: true }, { new: true });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

// Coupons Management
exports.getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }
    
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const coupons = await Coupons.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      lean: true,
    });

    res.json({
      items: coupons.docs,
      pagination: {
        total: coupons.totalDocs,
        page: coupons.page,
        totalPages: coupons.totalPages,
        limit: coupons.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupons.create(req.body);
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupons.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupons.findByIdAndDelete(id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

// Blog Posts Management
exports.getBlogPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, archive } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { slug: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
      ];
    }
    
    if (archive === 'true') query.archive = true;
    else if (archive === 'false') query.archive = false;
    else query.archive = false;

    const blogposts = await Blogposts.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'firstName lastName email' },
      lean: true,
    });

    res.json({
      items: blogposts.docs,
      pagination: {
        total: blogposts.totalDocs,
        page: blogposts.page,
        totalPages: blogposts.totalPages,
        limit: blogposts.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blogpost = await Blogposts.findByIdAndUpdate(id, req.body, { new: true });
    if (!blogpost) return res.status(404).json({ error: 'Blog post not found' });
    res.json(blogpost);
  } catch (error) {
    next(error);
  }
};

exports.deleteBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blogpost = await Blogposts.findByIdAndUpdate(id, { archive: true }, { new: true });
    if (!blogpost) return res.status(404).json({ error: 'Blog post not found' });
    res.json(blogpost);
  } catch (error) {
    next(error);
  }
};

// Order Management
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingId } = req.body;
    
    if (!status) return res.status(400).json({ error: 'Status is required' });
    
    const update = { status };
    if (trackingId) update.trackingId = trackingId;
    
    const order = await Orders.findByIdAndUpdate(id, update, { new: true })
      .populate('userId', 'firstName lastName email')
      .populate('orderedProducts.productId', 'title slug');
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.refundOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Orders.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Update order status
    order.status = 'refunded';
    await order.save();
    
    // Refund logic would go here (e.g., create refund transaction, update wallet)
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Orders.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Product Management
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Products.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateProducts = async (req, res, next) => {
  try {
    const { productIds, updates } = req.body;
    if (!productIds || !Array.isArray(productIds) || !updates) {
      return res.status(400).json({ error: 'productIds array and updates object are required' });
    }
    
    const result = await Products.updateMany(
      { _id: { $in: productIds } },
      { $set: updates }
    );
    
    res.json({ modifiedCount: result.modifiedCount, matchedCount: result.matchedCount });
  } catch (error) {
    next(error);
  }
};

// User Management
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.toggleUserBlock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.banned = !user.banned;
    await user.save();
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// ==================== COMPREHENSIVE REPORTING ====================

exports.getComprehensiveReports = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;
    
    // Date grouping
    const dateGroupFormat = groupBy === 'month' ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : groupBy === 'week' ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

    // User Analytics
    const [userAnalytics, userCohorts, userSegmentation] = await Promise.all([
      Users.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, archive: { $ne: true } } },
        { $group: { _id: dateGroupFormat, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      Users.aggregate([
        { $match: { archive: { $ne: true } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $gte: ['$updatedAt', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
      Users.aggregate([
        { $match: { archive: { $ne: true } } },
        {
          $group: {
            _id: {
              city: '$location.city',
              platform: '$location.platform',
            },
            count: { $sum: 1 },
            avgOrders: { $avg: { $size: { $ifNull: ['$orders', []] } } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    // Order Analytics
    const [orderAnalytics, orderConversion, orderVelocity, refundRate] = await Promise.all([
      Orders.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: dateGroupFormat,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$amountPaid' },
            avgOrderValue: { $avg: '$amountPaid' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      Orders.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            completed: [{ $match: { status: { $in: ['delivered', 'completed'] } } }, { $count: 'count' }],
          },
        },
      ]),
      Orders.aggregate([
        { $match: { status: { $in: ['delivered', 'completed'] } } },
        {
          $group: {
            _id: null,
            avgDays: {
              $avg: {
                $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24],
              },
            },
          },
        },
      ]),
      Orders.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    // Product Analytics
    const [productSales, categoryPerformance, inventoryVelocity] = await Promise.all([
      Orders.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['delivered', 'completed'] } } },
        { $unwind: '$orderedProducts' },
        {
          $group: {
            _id: '$orderedProducts.productId',
            totalSales: { $sum: { $multiply: ['$orderedProducts.price', '$orderedProducts.qty'] } },
            unitsSold: { $sum: '$orderedProducts.qty' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalSales: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      ]),
      Orders.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: '$orderedProducts' },
        {
          $lookup: {
            from: 'products',
            localField: 'orderedProducts.productId',
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
        {
          $group: {
            _id: '$category.title',
            totalRevenue: { $sum: { $multiply: ['$orderedProducts.price', '$orderedProducts.qty'] } },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: { $multiply: ['$orderedProducts.price', '$orderedProducts.qty'] } },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),
      Products.aggregate([
        { $match: { archive: { $ne: true } } },
        {
          $project: {
            title: 1,
            is_stock: 1,
            original_price: 1,
            discounted_price: 1,
            lastSold: { $ifNull: ['$priceUpdatedAt', '$updatedAt'] },
            daysSinceUpdate: {
              $divide: [{ $subtract: [new Date(), { $ifNull: ['$priceUpdatedAt', '$updatedAt'] }] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        { $sort: { daysSinceUpdate: -1 } },
        { $limit: 100 },
      ]),
    ]);

    // Financial Analytics
    const [revenueBreakdown, profitMargins] = await Promise.all([
      Transactions.aggregate([
        { $match: { status: 'successful', type: 'credit', createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              $cond: [
                { $regexMatch: { input: '$narration', regex: /wallet funding/i } },
                'Wallet Funding',
                { $cond: [{ $regexMatch: { input: '$narration', regex: /deposit/i } }, 'Deposits', 'Other'] },
              ],
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Orders.aggregate([
        { $match: { status: { $in: ['delivered', 'completed'] }, createdAt: { $gte: start, $lte: end } } },
        { $unwind: '$orderedProducts' },
        {
          $lookup: {
            from: 'products',
            localField: 'orderedProducts.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$orderedProducts.price', '$orderedProducts.qty'] } },
            // Assuming cost is stored somewhere - adjust based on actual schema
            avgMargin: { $avg: { $subtract: ['$orderedProducts.price', { $ifNull: ['$product.cost', 0] }] } },
          },
        },
      ]),
    ]);

    // VTU Analytics
    const [vtuByNetwork, vtuByVendor] = await Promise.all([
      Transactions.aggregate([
        {
          $match: {
            status: 'successful',
            type: 'debit',
            narration: { $regex: /(airtime|data|sme|bundle|gifting)/i },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$network',
            totalAmount: { $sum: '$amount' },
            totalDataGB: { $sum: { $divide: [{ $ifNull: ['$dataAmount', 0] }, 1024] } },
            successCount: { $sum: 1 },
            failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),
      Transactions.aggregate([
        {
          $match: {
            status: 'successful',
            type: 'debit',
            narration: { $regex: /(airtime|data|sme|bundle|gifting)/i },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$vendor',
            totalAmount: { $sum: '$amount' },
            successCount: { $sum: 1 },
            avgResponseTime: { $avg: 0 }, // Would need timestamp tracking
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),
    ]);

    // Marketing Analytics
    const [couponEffectiveness, referralStats] = await Promise.all([
      Transactions.aggregate([
        { $match: { couponUsed: { $nin: [null, ''] }, createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$couponUsed',
            uses: { $sum: 1 },
            revenue: { $sum: '$amount' },
            avgDiscount: { $avg: '$discountApplied' },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            _id: 1,
            uses: 1,
            revenue: 1,
            avgDiscount: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
          },
        },
        { $sort: { uses: -1 } },
      ]),
      Users.aggregate([
        { $match: { referrals: { $gt: 0 }, archive: { $ne: true } } },
        {
          $group: {
            _id: null,
            totalReferrals: { $sum: '$referrals' },
            activeReferrers: { $sum: 1 },
            topReferrer: { $max: '$referrals' },
          },
        },
      ]),
    ]);

    // Operational Analytics
    const [failedTransactions, deliveryPerformance] = await Promise.all([
      Transactions.aggregate([
        { $match: { status: 'failed', createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              $cond: [
                { $regexMatch: { input: '$narration', regex: /airtime/i } },
                'Airtime',
                { $cond: [{ $regexMatch: { input: '$narration', regex: /data/i } }, 'Data', 'Other'] },
              ],
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Orders.aggregate([
        { $match: { status: { $in: ['delivered', 'in transit'] }, createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              state: '$deliveryAddress.state',
              city: '$deliveryAddress.city',
            },
            count: { $sum: 1 },
            avgDays: {
              $avg: {
                $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24],
              },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    const conversionRate = orderConversion[0]?.total?.[0]?.count
      ? (orderConversion[0]?.completed?.[0]?.count / orderConversion[0].total[0].count) * 100
      : 0;

    const refundRateCalc = refundRate[0]
      ? (refundRate[0].refunded / refundRate[0].total) * 100
      : 0;

    res.json({
      dateRange: { start, end },
      userAnalytics: {
        growth: userAnalytics,
        cohorts: userCohorts,
        segmentation: userSegmentation,
      },
      orderAnalytics: {
        trends: orderAnalytics,
        conversionRate,
        avgOrderVelocity: orderVelocity[0]?.avgDays || 0,
        refundRate: refundRateCalc,
      },
      productAnalytics: {
        topSellers: productSales,
        categoryPerformance,
        inventoryVelocity,
      },
      financialAnalytics: {
        revenueBreakdown,
        profitMargins: profitMargins[0] || {},
      },
      vtuAnalytics: {
        byNetwork: vtuByNetwork,
        byVendor: vtuByVendor,
      },
      marketingAnalytics: {
        couponEffectiveness,
        referralStats: referralStats[0] || {},
      },
      operationalAnalytics: {
        failedTransactions,
        deliveryPerformance,
      },
    });
  } catch (error) {
    console.error('Comprehensive reports error:', error);
    next(error);
  }
};

// ==================== ADVANCED ANALYTICS & ANOMALY DETECTION ====================

exports.getAnomalyDetection = async (req, res, next) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate baseline averages
    const [baselineMetrics, currentMetrics] = await Promise.all([
      // Last 30 days baseline
      Promise.all([
        Transactions.aggregate([
          { $match: { createdAt: { $gte: last30d, $lt: last7d } } },
          {
            $group: {
              _id: null,
              avgDailyTransactions: { $avg: { $size: { $ifNull: ['$transactions', []] } } },
              avgDailyRevenue: { $avg: '$amount' },
              avgFailureRate: {
                $avg: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
            },
          },
        ]),
        Orders.aggregate([
          { $match: { createdAt: { $gte: last30d, $lt: last7d } } },
          {
            $group: {
              _id: null,
              avgDailyOrders: { $sum: 1 },
              avgOrderValue: { $avg: '$amountPaid' },
            },
          },
        ]),
        Users.aggregate([
          { $match: { createdAt: { $gte: last30d, $lt: last7d } } },
          { $group: { _id: null, avgDailySignups: { $sum: 1 } } },
        ]),
      ]),
      // Current period (last 24h)
      Promise.all([
        Transactions.aggregate([
          { $match: { createdAt: { $gte: last24h } } },
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalRevenue: { $sum: '$amount' },
              failureCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
              successCount: { $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] } },
            },
          },
        ]),
        Orders.aggregate([
          { $match: { createdAt: { $gte: last24h } } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$amountPaid' },
              avgOrderValue: { $avg: '$amountPaid' },
            },
          },
        ]),
        Users.aggregate([
          { $match: { createdAt: { $gte: last24h } } },
          { $group: { _id: null, newSignups: { $sum: 1 } } },
        ]),
      ]),
    ]);

    const baseline = {
      avgDailyTransactions: baselineMetrics[0][0]?.avgDailyTransactions || 0,
      avgDailyRevenue: baselineMetrics[0][0]?.avgDailyRevenue || 0,
      avgFailureRate: baselineMetrics[0][0]?.avgFailureRate || 0,
      avgDailyOrders: baselineMetrics[1][0]?.avgDailyOrders || 0,
      avgOrderValue: baselineMetrics[1][0]?.avgOrderValue || 0,
      avgDailySignups: baselineMetrics[2][0]?.avgDailySignups || 0,
    };

    const current = {
      transactions: currentMetrics[0][0] || {},
      orders: currentMetrics[1][0] || {},
      signups: currentMetrics[2][0] || {},
    };

    // Detect anomalies (deviation > 50% from baseline)
    const anomalies = [];
    
    const transactionDeviation = baseline.avgDailyTransactions > 0
      ? ((current.transactions.totalTransactions - baseline.avgDailyTransactions) / baseline.avgDailyTransactions) * 100
      : 0;
    if (Math.abs(transactionDeviation) > 50) {
      anomalies.push({
        type: 'transaction_volume',
        severity: transactionDeviation > 0 ? 'high' : 'low',
        deviation: transactionDeviation.toFixed(1),
        message: `Transaction volume ${transactionDeviation > 0 ? 'spiked' : 'dropped'} by ${Math.abs(transactionDeviation).toFixed(1)}%`,
      });
    }

    const failureRate = current.transactions.totalTransactions > 0
      ? (current.transactions.failureCount / current.transactions.totalTransactions) * 100
      : 0;
    if (failureRate > baseline.avgFailureRate * 1.5) {
      anomalies.push({
        type: 'failure_rate',
        severity: 'critical',
        deviation: failureRate.toFixed(1),
        message: `Transaction failure rate increased to ${failureRate.toFixed(1)}% (baseline: ${(baseline.avgFailureRate * 100).toFixed(1)}%)`,
      });
    }

    const orderDeviation = baseline.avgDailyOrders > 0
      ? ((current.orders.totalOrders - baseline.avgDailyOrders) / baseline.avgDailyOrders) * 100
      : 0;
    if (Math.abs(orderDeviation) > 50) {
      anomalies.push({
        type: 'order_volume',
        severity: orderDeviation > 0 ? 'high' : 'low',
        deviation: orderDeviation.toFixed(1),
        message: `Order volume ${orderDeviation > 0 ? 'spiked' : 'dropped'} by ${Math.abs(orderDeviation).toFixed(1)}%`,
      });
    }

    // Fraud detection patterns
    const fraudPatterns = await Transactions.aggregate([
      { $match: { createdAt: { $gte: last24h } } },
      {
        $group: {
          _id: '$userId',
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          failureCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          uniqueReferences: { $addToSet: '$reference' },
        },
      },
      {
        $project: {
          userId: '$_id',
          transactionCount: 1,
          totalAmount: 1,
          failureRate: { $divide: ['$failureCount', '$transactionCount'] },
          uniqueReferences: { $size: '$uniqueReferences' },
        },
      },
      {
        $match: {
          $or: [
            { transactionCount: { $gt: 20 } }, // Too many transactions
            { failureRate: { $gt: 0.5 } }, // High failure rate
            { totalAmount: { $gt: 1000000 } }, // Suspiciously high amount
          ],
        },
      },
      { $limit: 20 },
    ]);

    // Suspicious funding patterns
    const suspiciousFunding = await Transactions.aggregate([
      {
        $match: {
          type: 'credit',
          status: 'successful',
          narration: { $regex: /wallet funding|deposit/i },
          createdAt: { $gte: last24h },
        },
      },
      {
        $group: {
          _id: '$userId',
          fundingCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          timeWindow: {
            $push: '$createdAt',
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          fundingCount: 1,
          totalAmount: 1,
          avgAmount: 1,
          timeWindow: 1,
          rapidFunding: {
            $cond: [{ $gt: ['$fundingCount', 5] }, true, false],
          },
        },
      },
      {
        $match: {
          $or: [
            { fundingCount: { $gt: 5 } },
            { totalAmount: { $gt: 500000 } },
          ],
        },
      },
      { $limit: 20 },
    ]);

    res.json({
      anomalies,
      fraudPatterns: fraudPatterns.map((p) => ({
        userId: p.userId,
        transactionCount: p.transactionCount,
        totalAmount: p.totalAmount,
        failureRate: (p.failureRate * 100).toFixed(1),
        riskScore: calculateRiskScore(p),
      })),
      suspiciousFunding: suspiciousFunding.map((f) => ({
        userId: f.userId,
        fundingCount: f.fundingCount,
        totalAmount: f.totalAmount,
        avgAmount: f.avgAmount,
        rapidFunding: f.rapidFunding,
      })),
      baseline,
      current,
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    next(error);
  }
};

function calculateRiskScore(pattern) {
  let score = 0;
  if (pattern.transactionCount > 20) score += 30;
  if (pattern.failureRate > 0.5) score += 40;
  if (pattern.totalAmount > 1000000) score += 30;
  return Math.min(100, score);
}

// ==================== ADVANCED USER ANALYTICS ====================

exports.getAdvancedUserAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;
    const minus30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const minus90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // User Lifetime Value (LTV)
    const ltvAnalysis = await Users.aggregate([
      { $match: { createdAt: { $gte: minus90d }, archive: { $ne: true } } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'transactions',
        },
      },
      {
        $project: {
          userId: '$_id',
          firstName: 1,
          lastName: 1,
          email: 1,
          createdAt: 1,
          totalOrderValue: { $sum: '$orders.amountPaid' },
          totalTransactions: { $size: '$transactions' },
          totalSpent: {
            $sum: {
              $map: {
                input: { $filter: { input: '$transactions', as: 'tx', cond: { $eq: ['$$tx.type', 'debit'] } } },
                as: 'debit',
                in: '$$debit.amount',
              },
            },
          },
          orderCount: { $size: '$orders' },
          daysSinceSignup: {
            $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      {
        $project: {
          userId: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          totalOrderValue: 1,
          totalSpent: 1,
          orderCount: 1,
          daysSinceSignup: 1,
          ltv: { $ifNull: ['$totalOrderValue', 0] },
          avgOrderValue: {
            $cond: [{ $gt: ['$orderCount', 0] }, { $divide: ['$totalOrderValue', '$orderCount'] }, 0],
          },
          ltvPerDay: {
            $cond: [
              { $gt: ['$daysSinceSignup', 0] },
              { $divide: [{ $ifNull: ['$totalOrderValue', 0] }, '$daysSinceSignup'] },
              0,
            ],
          },
        },
      },
      { $sort: { ltv: -1 } },
      { $limit: 100 },
    ]);

    // Churn prediction
    const churnAnalysis = await Users.aggregate([
      { $match: { archive: { $ne: true } } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $project: {
          userId: '$_id',
          createdAt: 1,
          updatedAt: 1,
          lastOrderDate: { $max: '$orders.createdAt' },
          orderCount: { $size: '$orders' },
          daysSinceLastActivity: {
            $divide: [
              { $subtract: [now, { $ifNull: ['$updatedAt', '$createdAt'] }] },
              1000 * 60 * 60 * 24,
            ],
          },
          daysSinceLastOrder: {
            $cond: [
              { $gt: [{ $size: '$orders' }, 0] },
              {
                $divide: [{ $subtract: [now, { $max: '$orders.createdAt' }] }, 1000 * 60 * 60 * 24],
              },
              {
                $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 60 * 60 * 24],
              },
            ],
          },
        },
      },
      {
        $project: {
          userId: 1,
          orderCount: 1,
          daysSinceLastActivity: 1,
          daysSinceLastOrder: 1,
          churnRisk: {
            $cond: [
              { $and: [{ $gt: ['$daysSinceLastOrder', 30] }, { $gt: ['$orderCount', 0] }] },
              'high',
              {
                $cond: [
                  { $and: [{ $gt: ['$daysSinceLastOrder', 14] }, { $gt: ['$orderCount', 0] }] },
                  'medium',
                  {
                    $cond: [{ $gt: ['$daysSinceLastActivity', 60] }, 'medium', 'low'],
                  },
                ],
              },
            ],
          },
        },
      },
      { $match: { churnRisk: { $in: ['high', 'medium'] } } },
      { $sort: { daysSinceLastOrder: -1 } },
      { $limit: 200 },
    ]);

    // Behavior clustering
    const behaviorClusters = await Users.aggregate([
      { $match: { archive: { $ne: true }, createdAt: { $gte: minus90d } } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'transactions',
        },
      },
      {
        $project: {
          userId: '$_id',
          orderCount: { $size: '$orders' },
          totalSpent: { $sum: '$orders.amountPaid' },
          vtuCount: {
            $size: {
              $filter: {
                input: '$transactions',
                as: 'tx',
                cond: {
                  $regexMatch: {
                    input: { $ifNull: ['$$tx.narration', ''] },
                    regex: /(airtime|data|sme|bundle)/i,
                  },
                },
              },
            },
          },
          daysSinceSignup: {
            $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      {
        $project: {
          userId: 1,
          orderCount: 1,
          totalSpent: 1,
          vtuCount: 1,
          daysSinceSignup: 1,
          cluster: {
            $cond: [
              { $and: [{ $gt: ['$orderCount', 3] }, { $gt: ['$totalSpent', 100000] }] },
              'high_value',
              {
                $cond: [
                  { $gt: ['$vtuCount', 10] },
                  'vtu_heavy',
                  {
                    $cond: [{ $gt: ['$orderCount', 0] }, 'active_buyer', 'inactive'] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$cluster',
          count: { $sum: 1 },
          avgSpent: { $avg: '$totalSpent' },
          avgOrders: { $avg: '$orderCount' },
        },
      },
    ]);

    // Engagement rate
    const engagementMetrics = await Users.aggregate([
      { $match: { archive: { $ne: true } } },
      {
        $facet: {
          totalUsers: [{ $count: 'count' }],
          activeLast7d: [
            { $match: { updatedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } },
            { $count: 'count' },
          ],
          activeLast30d: [
            { $match: { updatedAt: { $gte: minus30d } } },
            { $count: 'count' },
          ],
          withOrders: [
            {
              $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'userId',
                as: 'orders',
              },
            },
            { $match: { orders: { $ne: [] } } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const engagement = engagementMetrics[0];
    const totalUsers = engagement.totalUsers[0]?.count || 0;
    const active7d = engagement.activeLast7d[0]?.count || 0;
    const active30d = engagement.activeLast30d[0]?.count || 0;
    const withOrders = engagement.withOrders[0]?.count || 0;

    res.json({
      ltvAnalysis: ltvAnalysis.slice(0, 50),
      churnAnalysis: churnAnalysis.slice(0, 100),
      behaviorClusters,
      engagement: {
        totalUsers,
        active7d,
        active30d,
        withOrders,
        engagementRate7d: totalUsers > 0 ? (active7d / totalUsers) * 100 : 0,
        engagementRate30d: totalUsers > 0 ? (active30d / totalUsers) * 100 : 0,
        conversionRate: totalUsers > 0 ? (withOrders / totalUsers) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Advanced user analytics error:', error);
    next(error);
  }
};

// ==================== REQUEST MANAGEMENT ====================

exports.getRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, vendorId, userId } = req.query;
    const query = { archive: { $ne: true } };

    if (status === 'confirmed') query.confirmation = true;
    else if (status === 'pending') query.confirmation = false;

    if (vendorId) query.vendorId = toObjectId(vendorId);
    if (userId) query.userId = toObjectId(userId);

    const requests = await Requests.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      populate: [
        { path: 'userId', select: 'firstName lastName email phoneNumber' },
        { path: 'vendorId', select: 'title slug' },
        { path: 'productId', select: 'title slug images' },
      ],
      lean: true,
    });

    res.json({
      items: requests.docs,
      pagination: {
        total: requests.totalDocs,
        page: requests.page,
        totalPages: requests.totalPages,
        limit: requests.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Requests.findByIdAndUpdate(id, req.body, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (error) {
    next(error);
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Requests.findByIdAndUpdate(id, { archive: true }, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (error) {
    next(error);
  }
};

// ==================== AMBASSADOR MANAGEMENT ====================

exports.getAmbassadors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, archive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { university: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') },
      ];
    }

    if (archive === 'true') query.archive = true;
    else if (archive === 'false') query.archive = false;
    else query.archive = { $ne: true };

    const ambassadors = await Ambassador.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      lean: true,
    });

    res.json({
      items: ambassadors.docs,
      pagination: {
        total: ambassadors.totalDocs,
        page: ambassadors.page,
        totalPages: ambassadors.totalPages,
        limit: ambassadors.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAmbassador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ambassador = await Ambassador.findByIdAndUpdate(id, req.body, { new: true });
    if (!ambassador) return res.status(404).json({ error: 'Ambassador not found' });
    res.json(ambassador);
  } catch (error) {
    next(error);
  }
};

exports.deleteAmbassador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ambassador = await Ambassador.findByIdAndUpdate(id, { archive: true }, { new: true });
    if (!ambassador) return res.status(404).json({ error: 'Ambassador not found' });
    res.json(ambassador);
  } catch (error) {
    next(error);
  }
};

// ==================== DELIVERY MANAGEMENT ====================

exports.getDeliveryMethods = async (req, res, next) => {
  try {
    const deliveryMethods = await Delivery.find({}).sort({ createdAt: -1 }).lean();
    res.json({ items: deliveryMethods });
  } catch (error) {
    next(error);
  }
};

exports.createDeliveryMethod = async (req, res, next) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.json(delivery);
  } catch (error) {
    next(error);
  }
};

exports.updateDeliveryMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByIdAndUpdate(id, req.body, { new: true });
    if (!delivery) return res.status(404).json({ error: 'Delivery method not found' });
    res.json(delivery);
  } catch (error) {
    next(error);
  }
};

exports.deleteDeliveryMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByIdAndDelete(id);
    if (!delivery) return res.status(404).json({ error: 'Delivery method not found' });
    res.json(delivery);
  } catch (error) {
    next(error);
  }
};

// ==================== SWAP/TRADE-IN MANAGEMENT ====================

exports.getSwaps = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { deviceName: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { preferreDeviceName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const swaps = await Swap.paginate(query, {
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Number(limit) || 10, 100),
      sort: { createdAt: -1 },
      populate: { path: 'userId', select: 'firstName lastName email phoneNumber' },
      lean: true,
    });

    res.json({
      items: swaps.docs,
      pagination: {
        total: swaps.totalDocs,
        page: swaps.page,
        totalPages: swaps.totalPages,
        limit: swaps.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSwap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const swap = await Swap.findByIdAndUpdate(id, req.body, { new: true });
    if (!swap) return res.status(404).json({ error: 'Swap request not found' });
    res.json(swap);
  } catch (error) {
    next(error);
  }
};

exports.deleteSwap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const swap = await Swap.findByIdAndDelete(id);
    if (!swap) return res.status(404).json({ error: 'Swap request not found' });
    res.json(swap);
  } catch (error) {
    next(error);
  }
};

// ==================== SOURCE ATTRIBUTION (WHATSAPP VS WEBSITE) ====================

exports.getSourceAttribution = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const [transactionAttribution, orderAttribution, userAttribution] = await Promise.all([
      Transactions.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$source',
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            successfulCount: { $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] } },
            failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            avgAmount: { $avg: '$amount' },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            source: '$_id',
            totalTransactions: 1,
            totalAmount: 1,
            successfulCount: 1,
            failedCount: 1,
            avgAmount: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            successRate: {
              $cond: [
                { $gt: ['$totalTransactions', 0] },
                { $multiply: [{ $divide: ['$successfulCount', '$totalTransactions'] }, 100] },
                0,
              ],
            },
          },
        },
      ]),
      Orders.aggregate([
        {
          $lookup: {
            from: 'transactions',
            localField: 'flutterwave.tx_ref',
            foreignField: 'reference',
            as: 'paymentTx',
          },
        },
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $project: {
            orderId: '$_id',
            amountPaid: 1,
            createdAt: 1,
            source: { $arrayElemAt: ['$paymentTx.source', 0] },
          },
        },
        {
          $group: {
            _id: '$source',
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$amountPaid' },
            avgOrderValue: { $avg: '$amountPaid' },
          },
        },
      ]),
      Users.aggregate([
        {
          $lookup: {
            from: 'transactions',
            localField: '_id',
            foreignField: 'userId',
            as: 'firstTx',
          },
        },
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $project: {
            userId: '$_id',
            createdAt: 1,
            firstTxSource: { $arrayElemAt: ['$firstTx.source', 0] },
          },
        },
        {
          $group: {
            _id: '$firstTxSource',
            newUsers: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      transactions: transactionAttribution,
      orders: orderAttribution,
      users: userAttribution,
    });
  } catch (error) {
    console.error('Source attribution error:', error);
    next(error);
  }
};

// ==================== VENDOR PERFORMANCE DASHBOARD ====================

exports.getVendorPerformance = async (req, res, next) => {
  try {
    const { vendorId, startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const matchFilter = { createdAt: { $gte: start, $lte: end } };
    if (vendorId) matchFilter.vendorId = toObjectId(vendorId);

    const [vendorStats, productPerformance, orderTrends] = await Promise.all([
      Products.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$vendorId',
            totalProducts: { $sum: 1 },
            totalViews: { $sum: '$views' },
            avgRating: { $avg: { $toDouble: '$rating' } },
            totalReviews: { $sum: '$reviews' },
            lowStockCount: {
              $sum: { $cond: [{ $lte: ['$is_stock', 5] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'vendors',
            localField: '_id',
            foreignField: '_id',
            as: 'vendor',
          },
        },
        { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'orderedProducts.productId',
            as: 'orders',
          },
        },
        {
          $project: {
            vendorId: '$_id',
            vendorName: '$vendor.title',
            totalProducts: 1,
            totalViews: 1,
            avgRating: 1,
            totalReviews: 1,
            lowStockCount: 1,
            orderCount: { $size: '$orders' },
            totalRevenue: {
              $sum: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: { $multiply: ['$$order.amountPaid', { $size: '$$order.orderedProducts' }] },
                },
              },
            },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),
      Products.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'orderedProducts.productId',
            as: 'orders',
          },
        },
        {
          $project: {
            productId: '$_id',
            title: 1,
            vendorId: 1,
            views: 1,
            rating: 1,
            reviews: 1,
            orderCount: { $size: '$orders' },
            unitsSold: {
              $sum: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$order.orderedProducts',
                        as: 'item',
                        in: {
                          $cond: [{ $eq: ['$$item.productId', '$_id'] }, '$$item.qty', 0],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        { $match: { orderCount: { $gt: 0 } } },
        { $sort: { orderCount: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: 'vendors',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'vendor',
          },
        },
        { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
      ]),
      Orders.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'orderedProducts.productId',
            foreignField: '_id',
            as: 'products',
          },
        },
        { $unwind: '$products' },
        { $match: { 'products.vendorId': matchFilter.vendorId ? toObjectId(matchFilter.vendorId) : { $exists: true }, createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            orderCount: { $sum: 1 },
            totalRevenue: { $sum: '$amountPaid' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
    ]);

    res.json({
      vendorStats,
      productPerformance,
      orderTrends,
    });
  } catch (error) {
    console.error('Vendor performance error:', error);
    next(error);
  }
};

// ==================== INVENTORY INTELLIGENCE ====================

exports.getInventoryIntelligence = async (req, res, next) => {
  try {
    const now = new Date();
    const minus30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const minus90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [inventoryHealth, velocityAnalysis, turnoverAnalysis, stockoutRisk] = await Promise.all([
      Products.aggregate([
        { $match: { archive: { $ne: true } } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'orderedProducts.productId',
            as: 'orders',
          },
        },
        {
          $project: {
            productId: '$_id',
            title: 1,
            categoryId: 1,
            is_stock: 1,
            original_price: 1,
            discounted_price: 1,
            views: 1,
            orderCount: { $size: '$orders' },
            unitsSold30d: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'order',
                      cond: { $gte: ['$$order.createdAt', minus30d] },
                    },
                  },
                  as: 'recentOrder',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$recentOrder.orderedProducts',
                        as: 'item',
                        in: {
                          $cond: [{ $eq: ['$$item.productId', '$_id'] }, '$$item.qty', 0],
                        },
                      },
                    },
                  },
                },
              },
            },
            unitsSold90d: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'order',
                      cond: { $gte: ['$$order.createdAt', minus90d] },
                    },
                  },
                  as: 'recentOrder',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$recentOrder.orderedProducts',
                        as: 'item',
                        in: {
                          $cond: [{ $eq: ['$$item.productId', '$_id'] }, '$$item.qty', 0],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            productId: 1,
            title: 1,
            categoryId: 1,
            currentStock: '$is_stock',
            price: { $ifNull: ['$discounted_price', '$original_price'] },
            views: 1,
            orderCount: 1,
            unitsSold30d: 1,
            unitsSold90d: 1,
            dailyVelocity30d: { $divide: ['$unitsSold30d', 30] },
            dailyVelocity90d: { $divide: ['$unitsSold90d', 90] },
            daysUntilStockout: {
              $cond: [
                { $gt: ['$is_stock', 0] },
                {
                  $cond: [
                    { $gt: [{ $divide: ['$unitsSold30d', 30] }, 0] },
                    { $divide: ['$is_stock', { $divide: ['$unitsSold30d', 30] }] },
                    999,
                  ],
                },
                0,
              ],
            },
            stockoutRisk: {
              $cond: [
                { $lte: ['$is_stock', 0] },
                'out_of_stock',
                {
                  $cond: [
                    { $lte: [{ $divide: ['$is_stock', { $ifNull: [{ $divide: ['$unitsSold30d', 30] }, 1] }] }, 7] },
                    'critical',
                    {
                      $cond: [
                        { $lte: [{ $divide: ['$is_stock', { $ifNull: [{ $divide: ['$unitsSold30d', 30] }, 1] }] }, 14] },
                        'high',
                        {
                          $cond: [
                            { $lte: [{ $divide: ['$is_stock', { $ifNull: [{ $divide: ['$unitsSold30d', 30] }, 1] }] }, 30] },
                            'medium',
                            'low',
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        { $sort: { daysUntilStockout: 1 } },
        { $limit: 200 },
      ]),
      Products.aggregate([
        { $match: { archive: { $ne: true }, is_stock: { $gt: 0 } } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'orderedProducts.productId',
            as: 'orders',
          },
        },
        {
          $project: {
            productId: '$_id',
            title: 1,
            categoryId: 1,
            is_stock: 1,
            unitsSold30d: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'order',
                      cond: { $gte: ['$$order.createdAt', minus30d] },
                    },
                  },
                  as: 'recentOrder',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$recentOrder.orderedProducts',
                        as: 'item',
                        in: {
                          $cond: [{ $eq: ['$$item.productId', '$_id'] }, '$$item.qty', 0],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            productId: 1,
            title: 1,
            categoryId: 1,
            currentStock: '$is_stock',
            unitsSold30d: 1,
            velocity: { $divide: ['$unitsSold30d', 30] },
            turnoverRatio: {
              $cond: [
                { $gt: ['$is_stock', 0] },
                { $divide: ['$unitsSold30d', '$is_stock'] },
                0,
              ],
            },
          },
        },
        { $sort: { velocity: -1 } },
        { $limit: 100 },
      ]),
      Products.aggregate([
        { $match: { archive: { $ne: true } } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'orderedProducts.productId',
            as: 'orders',
          },
        },
        {
          $project: {
            categoryId: 1,
            is_stock: 1,
            unitsSold90d: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'order',
                      cond: { $gte: ['$$order.createdAt', minus90d] },
                    },
                  },
                  as: 'recentOrder',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$recentOrder.orderedProducts',
                        as: 'item',
                        in: {
                          $cond: [{ $eq: ['$$item.productId', '$_id'] }, '$$item.qty', 0],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$categoryId',
            totalStock: { $sum: '$is_stock' },
            totalSold90d: { $sum: '$unitsSold90d' },
            productCount: { $sum: 1 },
          },
        },
        {
          $project: {
            categoryId: '$_id',
            totalStock: 1,
            totalSold90d: 1,
            productCount: 1,
            avgStock: { $divide: ['$totalStock', '$productCount'] },
            turnoverRate: {
              $cond: [
                { $gt: ['$totalStock', 0] },
                { $divide: ['$totalSold90d', '$totalStock'] },
                0,
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { turnoverRate: -1 } },
      ]),
      Products.aggregate([
        { $match: { archive: { $ne: true } } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'orderedProducts.productId',
            as: 'orders',
          },
        },
        {
          $project: {
            productId: '$_id',
            title: 1,
            categoryId: 1,
            is_stock: 1,
            unitsSold30d: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'order',
                      cond: { $gte: ['$$order.createdAt', minus30d] },
                    },
                  },
                  as: 'recentOrder',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$recentOrder.orderedProducts',
                        as: 'item',
                        in: {
                          $cond: [{ $eq: ['$$item.productId', '$_id'] }, '$$item.qty', 0],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            productId: 1,
            title: 1,
            categoryId: 1,
            currentStock: '$is_stock',
            unitsSold30d: 1,
            dailyVelocity: {
              $cond: [
                { $gt: ['$unitsSold30d', 0] },
                { $divide: ['$unitsSold30d', 30] },
                0,
              ],
            },
            daysUntilStockout: {
              $cond: [
                { $and: [{ $gt: ['$is_stock', 0] }, { $gt: ['$unitsSold30d', 0] }] },
                { $divide: ['$is_stock', { $divide: ['$unitsSold30d', 30] }] },
                999,
              ],
            },
          },
        },
        {
          $match: {
            $or: [
              { currentStock: 0 },
              { daysUntilStockout: { $lte: 14 } },
            ],
          },
        },
        { $sort: { daysUntilStockout: 1 } },
        { $limit: 50 },
      ]),
    ]);

    res.json({
      inventoryHealth: inventoryHealth.slice(0, 100),
      velocityAnalysis: velocityAnalysis.slice(0, 50),
      turnoverAnalysis,
      stockoutRisk,
    });
  } catch (error) {
    console.error('Inventory intelligence error:', error);
    next(error);
  }
};

// ==================== AI CHAT PERFORMANCE ANALYTICS ====================

exports.getAiChatPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const [sessionStats, toolUsage, conversationQuality, userSatisfaction] = await Promise.all([
      ChatSessions.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            activeSessions: { $sum: { $cond: ['$isActive', 1, 0] } },
            avgMessagesPerSession: { $avg: { $size: '$messages' } },
            totalMessages: { $sum: { $size: '$messages' } },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            totalSessions: 1,
            activeSessions: 1,
            avgMessagesPerSession: 1,
            totalMessages: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
          },
        },
      ]),
      ChatSessions.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $unwind: '$messages' },
        {
          $match: {
            'messages.metadata': { $exists: true },
          },
        },
        {
          $project: {
            toolName: '$messages.metadata.toolName',
            timestamp: '$messages.timestamp',
          },
        },
        {
          $group: {
            _id: '$toolName',
            usageCount: { $sum: 1 },
            uniqueSessions: { $addToSet: '$_id' },
          },
        },
        {
          $project: {
            toolName: '$_id',
            usageCount: 1,
            uniqueSessions: { $size: '$uniqueSessions' },
          },
        },
        { $sort: { usageCount: -1 } },
      ]),
      ChatSessions.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $project: {
            sessionId: '$_id',
            messageCount: { $size: '$messages' },
            hasPurchase: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$messages',
                      as: 'msg',
                      cond: {
                        $regexMatch: {
                          input: '$$msg.content',
                          regex: /(purchase|buy|top.?up|data|airtime)/i,
                        },
                      },
                    },
                  },
                },
                0,
              ],
            },
            hasProductSearch: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$messages',
                      as: 'msg',
                      cond: {
                        $regexMatch: {
                          input: '$$msg.content',
                          regex: /(product|gadget|phone|laptop|search)/i,
                        },
                      },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            sessionsWithPurchase: { $sum: { $cond: ['$hasPurchase', 1, 0] } },
            sessionsWithProductSearch: { $sum: { $cond: ['$hasProductSearch', 1, 0] } },
            avgMessageCount: { $avg: '$messageCount' },
          },
        },
        {
          $project: {
            totalSessions: 1,
            sessionsWithPurchase: 1,
            sessionsWithProductSearch: 1,
            avgMessageCount: 1,
            purchaseConversionRate: {
              $multiply: [
                { $divide: ['$sessionsWithPurchase', '$totalSessions'] },
                100,
              ],
            },
            productSearchRate: {
              $multiply: [
                { $divide: ['$sessionsWithProductSearch', '$totalSessions'] },
                100,
              ],
            },
          },
        },
      ]),
      ChatSessions.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $project: {
            sessionId: '$_id',
            userId: 1,
            messageCount: { $size: '$messages' },
            lastMessageTime: { $max: '$messages.timestamp' },
            firstMessageTime: { $min: '$messages.timestamp' },
          },
        },
        {
          $project: {
            sessionId: 1,
            userId: 1,
            messageCount: 1,
            sessionDuration: {
              $divide: [
                { $subtract: ['$lastMessageTime', '$firstMessageTime'] },
                1000 * 60,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgMessageCount: { $avg: '$messageCount' },
            avgSessionDuration: { $avg: '$sessionDuration' },
            totalSessions: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      sessionStats: sessionStats[0] || {},
      toolUsage,
      conversationQuality: conversationQuality[0] || {},
      userSatisfaction: userSatisfaction[0] || {},
    });
  } catch (error) {
    console.error('AI chat performance error:', error);
    next(error);
  }
};

// ==================== FINANCIAL RECONCILIATION ====================

exports.getFinancialReconciliation = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const [walletReconciliation, transactionMatching, balanceAudit] = await Promise.all([
      Transactions.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$userId',
            totalCredits: {
              $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
            totalDebits: {
              $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
            successfulCredits: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$type', 'credit'] }, { $eq: ['$status', 'successful'] }] },
                  '$amount',
                  0,
                ],
              },
            },
            successfulDebits: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$type', 'debit'] }, { $eq: ['$status', 'successful'] }] },
                  '$amount',
                  0,
                ],
              },
            },
            failedCredits: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$type', 'credit'] }, { $eq: ['$status', 'failed'] }] },
                  '$amount',
                  0,
                ],
              },
            },
            failedDebits: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$type', 'debit'] }, { $eq: ['$status', 'failed'] }] },
                  '$amount',
                  0,
                ],
              },
            },
            transactionCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'userId',
            as: 'wallet',
          },
        },
        { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: '$_id',
            walletBalance: { $ifNull: ['$wallet.balance', 0] },
            totalCredits: 1,
            totalDebits: 1,
            successfulCredits: 1,
            successfulDebits: 1,
            failedCredits: 1,
            failedDebits: 1,
            transactionCount: 1,
            calculatedBalance: {
              $subtract: ['$successfulCredits', '$successfulDebits'],
            },
            balanceDiscrepancy: {
              $subtract: [
                { $ifNull: ['$wallet.balance', 0] },
                { $subtract: ['$successfulCredits', '$successfulDebits'] },
              ],
            },
          },
        },
        {
          $match: {
            $or: [
              { balanceDiscrepancy: { $ne: 0 } },
              { failedCredits: { $gt: 0 } },
              { failedDebits: { $gt: 0 } },
            ],
          },
        },
        { $sort: { balanceDiscrepancy: -1 } },
        { $limit: 100 },
      ]),
      Orders.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $lookup: {
            from: 'transactions',
            localField: 'flutterwave.tx_ref',
            foreignField: 'reference',
            as: 'paymentTx',
          },
        },
        {
          $project: {
            orderId: '$_id',
            trackingId: 1,
            amountPaid: 1,
            status: 1,
            paymentReference: '$flutterwave.tx_ref',
            paymentTx: { $arrayElemAt: ['$paymentTx', 0] },
          },
        },
        {
          $project: {
            orderId: 1,
            trackingId: 1,
            amountPaid: 1,
            orderStatus: '$status',
            paymentReference: 1,
            paymentStatus: '$paymentTx.status',
            paymentAmount: '$paymentTx.amount',
            hasMatchingPayment: { $gt: [{ $size: { $ifNull: ['$paymentTx', []] } }, 0] },
            amountMatch: {
              $eq: ['$amountPaid', { $ifNull: ['$paymentTx.amount', 0] }],
            },
          },
        },
        {
          $match: {
            $or: [
              { hasMatchingPayment: false },
              { amountMatch: false },
              { paymentStatus: { $ne: 'successful' } },
            ],
          },
        },
        { $limit: 100 },
      ]),
      Wallets.aggregate([
        {
          $lookup: {
            from: 'transactions',
            localField: 'userId',
            foreignField: 'userId',
            as: 'transactions',
          },
        },
        {
          $project: {
            userId: '$_id',
            currentBalance: '$balance',
            loanBalance: '$loanBalance',
            totalCredits: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$transactions',
                      as: 'tx',
                      cond: {
                        $and: [
                          { $eq: ['$$tx.type', 'credit'] },
                          { $eq: ['$$tx.status', 'successful'] },
                        ],
                      },
                    },
                  },
                  as: 'credit',
                  in: '$$credit.amount',
                },
              },
            },
            totalDebits: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$transactions',
                      as: 'tx',
                      cond: {
                        $and: [
                          { $eq: ['$$tx.type', 'debit'] },
                          { $eq: ['$$tx.status', 'successful'] },
                        ],
                      },
                    },
                  },
                  as: 'debit',
                  in: '$$debit.amount',
                },
              },
            },
          },
        },
        {
          $project: {
            userId: 1,
            currentBalance: 1,
            loanBalance: 1,
            calculatedBalance: { $subtract: ['$totalCredits', '$totalDebits'] },
            balanceDiscrepancy: {
              $subtract: ['$currentBalance', { $subtract: ['$totalCredits', '$totalDebits'] }],
            },
          },
        },
        {
          $match: {
            balanceDiscrepancy: { $ne: 0 },
          },
        },
        { $sort: { balanceDiscrepancy: -1 } },
        { $limit: 100 },
      ]),
    ]);

    res.json({
      walletReconciliation,
      transactionMatching,
      balanceAudit,
    });
  } catch (error) {
    console.error('Financial reconciliation error:', error);
    next(error);
  }
};
