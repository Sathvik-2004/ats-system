const Application = require('../models/Application');
const PDFDocument = require('pdfkit');
const { logAction } = require('./auditController');
const { success, failure } = require('../utils/response');

const buildReportMatch = (query = {}) => {
  const match = {};

  if (query.jobTitle && query.jobTitle !== 'all') {
    match.jobTitle = { $regex: String(query.jobTitle), $options: 'i' };
  }

  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;

  if (from && !Number.isNaN(from.getTime())) {
    match.createdAt = { ...(match.createdAt || {}), $gte: from };
  }

  if (to && !Number.isNaN(to.getTime())) {
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    match.createdAt = { ...(match.createdAt || {}), $lte: endOfDay };
  }

  return match;
};

const aggregateApplicationsPerJob = async (match = {}) => {
  return Application.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$jobTitle',
        totalApplications: { $sum: 1 },
        shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
        hired: { $sum: { $cond: [{ $eq: ['$status', 'selected'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
      }
    },
    { $sort: { totalApplications: -1 } }
  ]);
};

const applicationsPerJob = async (req, res) => {
  try {
    const match = buildReportMatch(req.query);
    const data = await aggregateApplicationsPerJob(match);

    return success(res, data);
  } catch (error) {
    return failure(res, 'Failed to generate report', { statusCode: 500, code: 'REPORT_GENERATE_FAILED' });
  }
};

const reportSummary = async (req, res) => {
  try {
    const match = buildReportMatch(req.query);

    const [statusDistribution, trend] = await Promise.all([
      Application.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Application.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    await logAction({
      userId: req.user?.id,
      userName: req.user?.name || req.user?.email,
      action: 'read',
      resourceType: 'report',
      resourceName: 'applications_summary',
      details: { event: 'report_summary_view', filters: req.query },
      ipAddress: req.ip
    });

    return success(res, {
      statusDistribution: statusDistribution.map((item) => ({
        status: item._id,
        count: item.count
      })),
      trend: trend.map((item) => ({ date: item._id, count: item.count }))
    });
  } catch (_error) {
    return failure(res, 'Failed to fetch report summary', { statusCode: 500, code: 'REPORT_SUMMARY_FETCH_FAILED' });
  }
};

const applicationsPerJobCsv = async (req, res) => {
  try {
    const match = buildReportMatch(req.query);
    const report = await aggregateApplicationsPerJob(match);

    const headers = ['Job Title', 'Total Applications', 'Shortlisted', 'Hired', 'Rejected'];
    const rows = report.map((row) => [row._id || 'Unknown', row.totalApplications, row.shortlisted, row.hired]);
    const normalizedRows = rows.map((row, index) => [...row, report[index].rejected || 0]);
    const csv = [headers.join(','), ...normalizedRows.map((row) => row.map((v) => `"${v}"`).join(','))].join('\n');

    await logAction({
      userId: req.user?.id,
      userName: req.user?.name || req.user?.email,
      action: 'export',
      resourceType: 'report',
      resourceName: 'applications_per_job_csv',
      details: { event: 'report_export_csv', filters: req.query, rows: normalizedRows.length },
      ipAddress: req.ip
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications-per-job.csv');
    res.send(csv);
  } catch (error) {
    return failure(res, 'Failed to export report', { statusCode: 500, code: 'REPORT_EXPORT_CSV_FAILED' });
  }
};

const applicationsPerJobPdf = async (req, res) => {
  try {
    const match = buildReportMatch(req.query);
    const report = await aggregateApplicationsPerJob(match);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `applications-per-job-${Date.now()}.pdf`;

    await logAction({
      userId: req.user?.id,
      userName: req.user?.name || req.user?.email,
      action: 'export',
      resourceType: 'report',
      resourceName: 'applications_per_job_pdf',
      details: { event: 'report_export_pdf', filters: req.query, rows: report.length },
      ipAddress: req.ip
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    doc.pipe(res);

    doc.fontSize(18).text('Applications Per Job Report', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(0.8);

    const fromText = req.query.from ? `From: ${req.query.from}` : 'From: —';
    const toText = req.query.to ? `To: ${req.query.to}` : 'To: —';
    const roleText = req.query.jobTitle ? `Job: ${req.query.jobTitle}` : 'Job: All';
    doc.fontSize(10).text(`${fromText} | ${toText} | ${roleText}`);
    doc.moveDown(0.8);

    doc.fontSize(11).text('Job Title', 40, doc.y, { width: 210 });
    doc.text('Total', 260, doc.y - 11, { width: 60, align: 'right' });
    doc.text('Shortlisted', 320, doc.y - 11, { width: 80, align: 'right' });
    doc.text('Hired', 400, doc.y - 11, { width: 60, align: 'right' });
    doc.text('Rejected', 460, doc.y - 11, { width: 70, align: 'right' });
    doc.moveDown(0.4);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#cccccc');
    doc.moveDown(0.4);

    report.forEach((row) => {
      const y = doc.y;
      doc.fontSize(10).text(row._id || 'Unknown', 40, y, { width: 210 });
      doc.text(String(row.totalApplications || 0), 260, y, { width: 60, align: 'right' });
      doc.text(String(row.shortlisted || 0), 320, y, { width: 80, align: 'right' });
      doc.text(String(row.hired || 0), 400, y, { width: 60, align: 'right' });
      doc.text(String(row.rejected || 0), 460, y, { width: 70, align: 'right' });
      doc.moveDown(0.6);
    });

    doc.end();
  } catch (_error) {
    return failure(res, 'Failed to export PDF report', { statusCode: 500, code: 'REPORT_EXPORT_PDF_FAILED' });
  }
};

module.exports = { applicationsPerJob, applicationsPerJobCsv, applicationsPerJobPdf, reportSummary };
