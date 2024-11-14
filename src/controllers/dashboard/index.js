// src/controllers/dashboard/index.js
const { Property, Transfer, User } = require('../../models');
const { asyncHandler } = require('../../middleware/error');

exports.getDashboardStats = asyncHandler(async (req, res) => {
    const [
      totalProperties,
      verifiedProperties,
      unverifiedProperties,
      totalTransfers
    ] = await Promise.all([
      Property.countDocuments({ owner: req.user.id }),
      Property.countDocuments({ 
        owner: req.user.id, 
        verificationStatus: 'verified' 
      }),
      Property.countDocuments({ 
        owner: req.user.id, 
        verificationStatus: 'unverified' 
      }),
      Transfer.countDocuments({
        $or: [
          { fromOwner: req.user.id },
          { toOwner: req.user.id }
        ]
      })
    ]);
  
    res.json({
      totalProperties,
      verifiedProperties,
      unverifiedProperties,
      totalTransfers
    });
  });

exports.getRegistrationTrends = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const properties = await Property.find({
    owner: req.user.id,
    createdAt: { $gte: sixMonthsAgo }
  }).select('createdAt');

  const monthlyData = properties.reduce((acc, property) => {
    const month = property.createdAt.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const trends = Object.entries(monthlyData).map(([month, registrations]) => ({
    month,
    registrations
  }));

  res.json(trends);
});

exports.getRecentActivities = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user.id })
    .select('history title location')
    .sort({ 'history.timestamp': -1 })
    .limit(10);

  const transfers = await Transfer.find({
    $or: [
      { fromOwner: req.user.id },
      { toOwner: req.user.id }
    ]
  })
  .populate('property', 'title')
  .sort({ createdAt: -1 })
  .limit(5);

  const activities = [
    ...properties.flatMap(property => 
      property.history.map(h => ({
        id: h._id,
        type: h.action.includes('dispute') ? 'dispute' : 'registration',
        title: h.action === 'created' ? 'New Property Registration' : 
              h.action === 'dispute_filed' ? 'Property Dispute Filed' : 
              'Property Updated',
        description: `${property.title} at ${property.location.area}`,
        date: h.timestamp,
        status: h.action === 'created' ? 'completed' : 'pending'
      }))
    ),
    ...transfers.map(transfer => ({
      id: transfer._id,
      type: 'transfer',
      title: 'Property Transfer Request',
      description: `Transfer request for ${transfer.property.title}`,
      date: transfer.createdAt,
      status: transfer.status === 'completed' ? 'completed' : 'pending'
    }))
  ]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 10);

  res.json(activities);
});