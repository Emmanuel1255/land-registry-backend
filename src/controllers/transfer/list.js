// src/controllers/transfer/list.js
const { Transfer } = require('../../models');
const { AppError } = require('../../middleware/error');

exports.listTransfers = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    // Filter by user role
    if (req.user.role !== 'admin') {
      query.$or = [
        { fromOwner: req.user.id },
        { toOwner: req.user.id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const transfers = await Transfer.find(query)
      .populate('property', 'title location price')
      .populate('fromOwner', 'firstName lastName email')
      .populate('toOwner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Transfer.countDocuments(query);

    res.json({
      transfers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};