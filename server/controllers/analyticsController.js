const Application = require('../models/Application');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { success, failure } = require('../utils/response');

/**
 * Get dashboard analytics data
 * Returns: total applications, pending, interviews, hired
 */
exports.getDashboardMetrics = async (req, res) => {
  try {
    const now = new Date();
    const activeMatch = { status: { $ne: 'withdrawn' } };

    // Get total applications
    const totalApplications = await Application.countDocuments(activeMatch);

    // Get pending reviews
    const pendingReviews = await Application.countDocuments({
      ...activeMatch,
      status: { $in: ['applied', 'reviewing'] }
    });

    // Get interviews scheduled
    const interviewsScheduled = await Application.countDocuments({
      ...activeMatch,
      'interviewScheduled.date': { $exists: true, $ne: null }
    });

    // Get hired candidates
    const hired = await Application.countDocuments({ ...activeMatch, status: 'selected' });

    // Get rejected applications
    const rejected = await Application.countDocuments({ ...activeMatch, status: 'rejected' });

    // Get shortlisted candidates
    const shortlisted = await Application.countDocuments({ ...activeMatch, status: 'shortlisted' });

    const metrics = {
      totalApplications,
      pendingReviews,
      interviewsScheduled,
      hired,
      rejected,
      shortlisted,
      lastUpdated: new Date().toISOString()
    };

    return success(res, metrics, { extra: { metrics } });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return failure(res, 'Failed to fetch dashboard metrics', {
      statusCode: 500,
      code: 'ANALYTICS_METRICS_FETCH_FAILED',
      details: process.env.NODE_ENV !== 'production' ? { error: error.message } : undefined
    });
  }
};

/**
 * Get applications over time (for line chart)
 * Returns: applications grouped by date for last 30 days
 */
exports.getApplicationsTrend = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'withdrawn' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format data for Recharts
    const formattedData = trend.map(item => ({
      date: item._id,
      applications: item.count
    }));

    return success(res, formattedData);
  } catch (error) {
    console.error('Error fetching applications trend:', error);
    return failure(res, 'Failed to fetch applications trend', {
      statusCode: 500,
      code: 'ANALYTICS_TREND_FETCH_FAILED',
      details: process.env.NODE_ENV !== 'production' ? { error: error.message } : undefined
    });
  }
};

/**
 * Get application status distribution (for pie chart)
 */
exports.getStatusDistribution = async (req, res) => {
  try {
    const distribution = await Application.aggregate([
      {
        $match: {
          status: { $ne: 'withdrawn' }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Format for pie chart
    const formattedData = distribution.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1).replace(/_/g, ' '),
      value: item.count,
      status: item._id
    }));

    return success(res, formattedData);
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    return failure(res, 'Failed to fetch status distribution', {
      statusCode: 500,
      code: 'ANALYTICS_STATUS_DISTRIBUTION_FAILED',
      details: process.env.NODE_ENV !== 'production' ? { error: error.message } : undefined
    });
  }
};

/**
 * Get hiring funnel data (for bar chart)
 * Shows progression through hiring stages
 */
exports.getHiringFunnel = async (req, res) => {
  try {
    const funnel = await Application.aggregate([
      {
        $match: {
          status: { $ne: 'withdrawn' }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Define funnel stages in order
    const stages = [
      { status: 'applied', label: 'Applied', order: 1 },
      { status: 'reviewing', label: 'Reviewing', order: 2 },
      { status: 'shortlisted', label: 'Shortlisted', order: 3 },
      { status: 'interview_scheduled', label: 'Interview Scheduled', order: 4 },
      { status: 'selected', label: 'Selected', order: 5 }
    ];

    const funnelData = stages.map(stage => {
      const stageData = funnel.find(f => f._id === stage.status);
      return {
        stage: stage.label,
        count: stageData?.count || 0,
        percentage: 0
      };
    });

    // Calculate percentages
    const totalApplied = funnelData[0]?.count || 1;
    funnelData.forEach(item => {
      item.percentage = Math.round((item.count / totalApplied) * 100);
    });

    return success(res, funnelData);
  } catch (error) {
    console.error('Error fetching hiring funnel:', error);
    return failure(res, 'Failed to fetch hiring funnel', {
      statusCode: 500,
      code: 'ANALYTICS_HIRING_FUNNEL_FAILED',
      details: process.env.NODE_ENV !== 'production' ? { error: error.message } : undefined
    });
  }
};

/**
 * Get comprehensive dashboard data (all metrics at once)
 */
exports.getFullDashboardData = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeMatch = { status: { $ne: 'withdrawn' } };

    // Parallel queries
    const [
      metrics,
      trend,
      statusDistribution,
      hiringFunnel,
      totalUsers
    ] = await Promise.all([
      Application.aggregate([
        { $match: activeMatch },
        {
          $facet: {
            totalApplications: [{ $count: 'count' }],
            pendingReviews: [
              { $match: { status: { $in: ['applied', 'reviewing'] } } },
              { $count: 'count' }
            ],
            interviewsScheduled: [
              { $match: { 'interviewScheduled.date': { $exists: true, $ne: null } } },
              { $count: 'count' }
            ],
            hired: [
              { $match: { status: 'selected' } },
              { $count: 'count' }
            ]
          }
        }
      ]),
      Application.aggregate([
        {
          $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'withdrawn' } }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Application.aggregate([
        {
          $match: {
            status: { $ne: 'withdrawn' }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Application.aggregate([
        {
          $match: {
            status: { $ne: 'withdrawn' }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      User.countDocuments({ role: 'candidate' })
    ]);

    // Format all data
    const formattedMetrics = {
      totalApplications: metrics[0].totalApplications[0]?.count || 0,
      pendingReviews: metrics[0].pendingReviews[0]?.count || 0,
      interviewsScheduled: metrics[0].interviewsScheduled[0]?.count || 0,
      hired: metrics[0].hired[0]?.count || 0,
      totalCandidates: totalUsers,
      lastUpdated: new Date().toISOString()
    };

    const formattedTrend = trend.map(item => ({
      date: item._id,
      applications: item.count
    }));

    const formattedDistribution = statusDistribution.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1).replace(/_/g, ' '),
      value: item.count
    }));

    // Format hiring funnel
    const stages = [
      { status: 'applied', label: 'Applied' },
      { status: 'reviewing', label: 'Reviewing' },
      { status: 'shortlisted', label: 'Shortlisted' },
      { status: 'interview_scheduled', label: 'Interview Scheduled' },
      { status: 'selected', label: 'Selected' }
    ];

    const formattedFunnel = stages.map(stage => {
      const stageData = hiringFunnel.find(f => f._id === stage.status);
      const count = stageData?.count || 0;
      const total = hiringFunnel.reduce((sum, item) => sum + item.count, 1);
      return {
        stage: stage.label,
        count: count,
        percentage: Math.round((count / total) * 100)
      };
    });

    return success(res, {
      metrics: formattedMetrics,
      trend: formattedTrend,
      statusDistribution: formattedDistribution,
      hiringFunnel: formattedFunnel
    });
  } catch (error) {
    console.error('Error fetching full dashboard data:', error);
    return failure(res, 'Failed to fetch dashboard data', {
      statusCode: 500,
      code: 'ANALYTICS_DASHBOARD_FETCH_FAILED',
      details: process.env.NODE_ENV !== 'production' ? { error: error.message } : undefined
    });
  }
};
