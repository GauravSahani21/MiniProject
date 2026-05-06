import User from '../models/User.js';
import Screening from '../models/Screening.js';
import Report from '../models/Report.js';
import mongoose from 'mongoose';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').lean();

    // Add screeningCount virtual
    const userIds = users.map(u => u._id);
    const screeningCounts = await Screening.aggregate([
      { $match: { parentId: { $in: userIds } } },
      { $group: { _id: '$parentId', count: { $sum: 1 } } }
    ]);

    const countMap = new Map();
    screeningCounts.forEach(sc => countMap.set(sc._id.toString(), sc.count));

    const usersWithCounts = users.map(u => ({
      ...u,
      screeningCount: countMap.get(u._id.toString()) || 0
    }));

    res.status(200).json({
      success: true,
      count: usersWithCounts.length,
      data: usersWithCounts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all screenings
// @route   GET /api/admin/screenings
// @access  Private (admin)
export const getAllScreenings = async (req, res, next) => {
  try {
    const screenings = await Screening.find()
      .populate('childId', 'name')
      .populate('parentId', 'name email')
      .sort({ screeningDate: -1 });

    res.status(200).json({
      success: true,
      count: screenings.length,
      data: screenings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalChildren = await mongoose.model('Child').countDocuments(); 
    
    const totalScreenings = await Screening.countDocuments();
    const highRiskCases = await Screening.countDocuments({ riskLevel: 'High' });
    const pendingReviews = await Screening.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalParents,
        totalDoctors,
        totalChildren,
        totalScreenings,
        highRiskCases,
        pendingReviews
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get monthly aggregate data
// @route   GET /api/admin/monthly
// @access  Private (admin)
export const getMonthlyData = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Screening.aggregate([
      {
        $match: {
          screeningDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$screeningDate' },
            month: { $month: '$screeningDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format output
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = monthlyData.map(item => ({
      month: monthNames[item._id.month - 1],
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system activity log
// @route   GET /api/admin/activity
// @access  Private (admin)
export const getActivityLog = async (req, res, next) => {
  try {
    // Get recent 10 users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name role createdAt');

    // Get recent 10 screenings
    const recentScreenings = await Screening.find()
      .sort({ screeningDate: -1 })
      .limit(10)
      .populate('parentId', 'name')
      .populate('childId', 'name');

    // Format and combine
    const activities = [];

    recentUsers.forEach(u => {
      activities.push({
        id: `user-${u._id}`,
        type: 'user_registration',
        message: `New ${u.role} joined: ${u.name}`,
        date: u.createdAt
      });
    });

    recentScreenings.forEach(s => {
      activities.push({
        id: `screening-${s._id}`,
        type: 'screening_completed',
        message: `${s.parentId?.name || 'A parent'} completed screening for ${s.childId?.name || 'their child'}`,
        date: s.screeningDate || s.createdAt 
      });
    });

    // Sort combined by date desc, return top 10
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const topActivities = activities.slice(0, 10);

    res.status(200).json({
      success: true,
      data: topActivities
    });

  } catch (err) {
    next(err);
  }
};
