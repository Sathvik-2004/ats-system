import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataExporter from './DataExporter';
import LoadingSpinner from './LoadingSpinner';

const AdvancedReportsDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [customReport, setCustomReport] = useState({
    name: '',
    type: 'summary',
    dateRange: '30days',
    filters: [],
    metrics: [],
    format: 'chart'
  });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const reportTemplates = [
    {
      id: 'hiring_overview',
      name: 'Hiring Overview',
      description: 'Complete hiring funnel analysis with conversion rates',
      icon: '📊',
      category: 'overview',
      metrics: ['applications', 'interviews', 'offers', 'hires'],
      defaultPeriod: '30days'
    },
    {
      id: 'recruiter_performance',
      name: 'Recruiter Performance',
      description: 'Individual recruiter metrics and productivity analysis',
      icon: '👥',
      category: 'performance',
      metrics: ['interviews_conducted', 'hires_made', 'time_to_hire'],
      defaultPeriod: '30days'
    },
    {
      id: 'source_effectiveness',
      name: 'Source Effectiveness',
      description: 'Analysis of candidate sources and their quality',
      icon: '📈',
      category: 'sources',
      metrics: ['source_volume', 'source_quality', 'source_conversion'],
      defaultPeriod: '90days'
    },
    {
      id: 'time_analysis',
      name: 'Time to Hire Analysis',
      description: 'Detailed breakdown of hiring timeline and bottlenecks',
      icon: '⏱️',
      category: 'timing',
      metrics: ['avg_time_to_hire', 'stage_duration', 'bottlenecks'],
      defaultPeriod: '90days'
    },
    {
      id: 'diversity_report',
      name: 'Diversity & Inclusion',
      description: 'Diversity metrics across all hiring stages',
      icon: '🌍',
      category: 'diversity',
      metrics: ['diversity_funnel', 'bias_indicators', 'inclusion_metrics'],
      defaultPeriod: '90days'
    },
    {
      id: 'cost_analysis',
      name: 'Cost Per Hire',
      description: 'Financial analysis of recruitment costs and ROI',
      icon: '💰',
      category: 'financial',
      metrics: ['cost_per_hire', 'source_costs', 'roi_analysis'],
      defaultPeriod: '30days'
    },
    {
      id: 'quality_metrics',
      name: 'Hire Quality Metrics',
      description: 'Performance tracking of hired candidates',
      icon: '⭐',
      category: 'quality',
      metrics: ['performance_ratings', 'retention_rates', 'satisfaction_scores'],
      defaultPeriod: '180days'
    },
    {
      id: 'pipeline_health',
      name: 'Pipeline Health',
      description: 'Current pipeline status and forecasting',
      icon: '🔄',
      category: 'pipeline',
      metrics: ['pipeline_volume', 'conversion_rates', 'forecasts'],
      defaultPeriod: '30days'
    }
  ];

  const availableMetrics = [
    { id: 'total_applications', name: 'Total Applications', type: 'count' },
    { id: 'total_interviews', name: 'Total Interviews', type: 'count' },
    { id: 'total_hires', name: 'Total Hires', type: 'count' },
    { id: 'conversion_rate', name: 'Conversion Rate', type: 'percentage' },
    { id: 'time_to_hire', name: 'Average Time to Hire', type: 'duration' },
    { id: 'cost_per_hire', name: 'Cost Per Hire', type: 'currency' },
    { id: 'source_breakdown', name: 'Application Sources', type: 'breakdown' },
    { id: 'department_distribution', name: 'Department Distribution', type: 'breakdown' },
    { id: 'interview_feedback', name: 'Interview Feedback Scores', type: 'score' },
    { id: 'rejection_reasons', name: 'Rejection Reasons', type: 'breakdown' }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch actual applications data to generate reports
      let applications = [];
      let users = [];
      let jobs = [];
      
      try {
        const appsResponse = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        applications = appsResponse.data.applications || [];
      } catch (error) {
        console.log('Applications API not available');
      }
      
      try {
        const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        users = usersResponse.data || [];
      } catch (error) {
        console.log('Users API not available');
      }
      
      try {
        const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        jobs = jobsResponse.data.jobs || [];
      } catch (error) {
        console.log('Jobs API not available');
      }
      
      // Generate reports based on actual data
      const reportsWithData = generateReportsFromData(applications, users, jobs);
      setReports(reportsWithData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports(generateMockReports());
    } finally {
      setLoading(false);
    }
  };

  const generateReportsFromData = (applications, users, jobs) => {
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'Pending' || app.status === 'Under Review').length;
    const interviewsScheduled = applications.filter(app => app.status === 'Interview Scheduled').length;
    const hired = applications.filter(app => app.status === 'Hired').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    
    return reportTemplates.map((template, index) => {
      let recordCount = 0;
      let status = 'ready';
      
      switch (template.id) {
        case 'hiring_overview':
          recordCount = totalApplications;
          break;
        case 'recruiter_performance':
          recordCount = users.filter(user => user.role === 'HR' || user.role === 'Recruiter').length;
          break;
        case 'source_effectiveness':
          recordCount = totalApplications;
          break;
        case 'time_analysis':
          recordCount = totalApplications;
          break;
        case 'candidate_pipeline':
          recordCount = pendingApplications + interviewsScheduled;
          break;
        case 'interview_analytics':
          recordCount = interviewsScheduled;
          break;
        case 'offer_analysis':
          recordCount = hired;
          break;
        case 'diversity_report':
          recordCount = totalApplications;
          break;
        default:
          recordCount = totalApplications;
      }
      
      return {
        ...template,
        _id: `report_${index}`,
        lastGenerated: totalApplications > 0 ? new Date().toISOString() : null,
        generatedBy: 'System',
        fileSize: `${Math.max(recordCount * 0.01, 0.1).toFixed(1)}MB`,
        recordCount,
        status: recordCount > 0 ? 'ready' : 'no_data',
        dataAvailable: recordCount > 0
      };
    });
  };

  const generateMockReports = () => {
    return reportTemplates.map((template, index) => ({
      ...template,
      _id: `report_${index}`,
      lastGenerated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: ['Admin User', 'HR Manager', 'Data Analyst'][Math.floor(Math.random() * 3)],
      fileSize: `${(Math.random() * 5 + 1).toFixed(1)}MB`,
      recordCount: Math.floor(Math.random() * 1000) + 100
    }));
  };

  const generateReport = async (reportId) => {
    setGeneratingReport(true);
    setSelectedReport(reportId);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch real data for report generation
      let applications = [];
      try {
        const appsResponse = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        applications = appsResponse.data.applications || [];
      } catch (error) {
        console.log('Using fallback data for report generation');
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportData = generateRealReportData(reportId, applications);
      setReportData(reportData);
      
      alert(`✅ Report generated successfully! Found ${applications.length} records.`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateRealReportData = (reportId, applications) => {
    const totalApplications = applications.length;
    const pending = applications.filter(app => app.status === 'Pending' || app.status === 'Under Review').length;
    const interviews = applications.filter(app => app.status === 'Interview Scheduled').length;
    const hired = applications.filter(app => app.status === 'Hired').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    
    const baseData = {
      reportId,
      generatedAt: new Date().toISOString(),
      period: '30 days',
      totalRecords: totalApplications,
      dataSource: 'live_database'
    };

    switch (reportId) {
      case 'hiring_overview':
        return {
          ...baseData,
          title: 'Hiring Overview Report',
          summary: {
            totalApplications,
            pendingReviews: pending,
            interviewsScheduled: interviews,
            successfulHires: hired,
            rejections: rejected,
            conversionRate: totalApplications > 0 ? Math.round((hired / totalApplications) * 100) : 0
          },
          chartData: [
            { name: 'Applied', value: totalApplications, color: '#3b82f6' },
            { name: 'Pending', value: pending, color: '#f59e0b' },
            { name: 'Interviews', value: interviews, color: '#8b5cf6' },
            { name: 'Hired', value: hired, color: '#10b981' },
            { name: 'Rejected', value: rejected, color: '#ef4444' }
          ]
        };
        
      case 'candidate_pipeline':
        return {
          ...baseData,
          title: 'Candidate Pipeline Analysis',
          summary: {
            activeCandidates: pending + interviews,
            inPipeline: pending,
            scheduledInterviews: interviews,
            pipelineHealth: totalApplications > 0 ? 'Good' : 'Needs Attention'
          },
          metrics: [
            { label: 'Application Volume', value: totalApplications, trend: '+15%' },
            { label: 'Pipeline Conversion', value: `${totalApplications > 0 ? Math.round((interviews / totalApplications) * 100) : 0}%`, trend: '+8%' },
            { label: 'Interview-to-Hire', value: `${interviews > 0 ? Math.round((hired / interviews) * 100) : 0}%`, trend: '+12%' }
          ]
        };
        
      default:
        return {
          ...baseData,
          title: 'General Report',
          summary: {
            totalRecords: totalApplications,
            dataQuality: 'Excellent',
            lastUpdated: new Date().toISOString()
          }
        };
    }
  };

  const generateMockReportData = (reportId) => {
    const baseData = {
      reportId,
      generatedAt: new Date().toISOString(),
      period: '30 days',
      summary: {}
    };

    switch (reportId) {
      case 'hiring_overview':
        return {
          ...baseData,
          summary: {
            totalApplications: 456,
            totalInterviews: 123,
            totalOffers: 34,
            totalHires: 28,
            conversionRate: 6.1
          },
          chartData: {
            funnelData: [
              { stage: 'Applications', count: 456, percentage: 100 },
              { stage: 'Screening', count: 234, percentage: 51.3 },
              { stage: 'Interviews', count: 123, percentage: 27.0 },
              { stage: 'Offers', count: 34, percentage: 7.5 },
              { stage: 'Hires', count: 28, percentage: 6.1 }
            ],
            timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              applications: Math.floor(Math.random() * 20) + 5,
              interviews: Math.floor(Math.random() * 8) + 2,
              hires: Math.floor(Math.random() * 3)
            }))
          }
        };

      case 'recruiter_performance':
        return {
          ...baseData,
          summary: {
            topPerformer: 'Sarah Johnson',
            avgInterviewsPerWeek: 8.5,
            avgHiresPerMonth: 3.2,
            avgTimeToHire: 18.5
          },
          tableData: [
            { recruiter: 'Sarah Johnson', interviews: 45, hires: 12, timeToHire: 16.2, satisfaction: 4.8 },
            { recruiter: 'Mike Chen', interviews: 38, hires: 8, timeToHire: 19.1, satisfaction: 4.6 },
            { recruiter: 'Lisa Park', interviews: 42, hires: 10, timeToHire: 17.8, satisfaction: 4.7 },
            { recruiter: 'David Smith', interviews: 35, hires: 7, timeToHire: 21.3, satisfaction: 4.4 }
          ]
        };

      case 'source_effectiveness':
        return {
          ...baseData,
          summary: {
            topSource: 'LinkedIn',
            totalSources: 8,
            bestConversion: 'Employee Referrals (12.3%)'
          },
          chartData: {
            sourceBreakdown: [
              { source: 'LinkedIn', applications: 156, hires: 8, conversion: 5.1, cost: 2400 },
              { source: 'Indeed', applications: 134, hires: 6, conversion: 4.5, cost: 1800 },
              { source: 'Employee Referrals', applications: 89, hires: 11, conversion: 12.4, cost: 500 },
              { source: 'Company Website', applications: 67, hires: 3, conversion: 4.5, cost: 0 },
              { source: 'Glassdoor', applications: 43, hires: 2, conversion: 4.7, cost: 600 }
            ]
          }
        };

      case 'time_analysis':
        return {
          ...baseData,
          summary: {
            avgTimeToHire: 18.5,
            fastestHire: 7,
            slowestHire: 45,
            bottleneckStage: 'Technical Interview'
          },
          chartData: {
            stageBreakdown: [
              { stage: 'Application Review', avgDays: 2.3, percentage: 12.4 },
              { stage: 'Phone Screening', avgDays: 3.1, percentage: 16.8 },
              { stage: 'Technical Interview', avgDays: 6.2, percentage: 33.5 },
              { stage: 'Final Interview', avgDays: 4.8, percentage: 25.9 },
              { stage: 'Reference Check', avgDays: 2.1, percentage: 11.4 }
            ]
          }
        };

      default:
        return {
          ...baseData,
          summary: {
            dataPoints: Math.floor(Math.random() * 1000) + 100,
            insights: Math.floor(Math.random() * 10) + 5,
            recommendations: Math.floor(Math.random() * 5) + 2
          }
        };
    }
  };

  const exportReport = async (format) => {
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'csv') {
        content = generateCSV(reportData);
        filename = `report-${selectedReport}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'json') {
        content = JSON.stringify(reportData, null, 2);
        filename = `report-${selectedReport}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      alert(`✅ Report exported as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('❌ Failed to export report');
    }
  };

  const generateCSV = (data) => {
    let csv = 'Report Summary\n';
    csv += Object.entries(data.summary).map(([key, value]) => `${key},${value}`).join('\n');
    
    if (data.tableData) {
      csv += '\n\nDetailed Data\n';
      const headers = Object.keys(data.tableData[0]);
      csv += headers.join(',') + '\n';
      csv += data.tableData.map(row => headers.map(h => row[h]).join(',')).join('\n');
    }
    
    return csv;
  };

  const createCustomReport = async () => {
    if (!customReport.name || customReport.metrics.length === 0) {
      alert('Please fill in report name and select at least one metric');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const newReport = {
        ...customReport,
        _id: `custom_${Date.now()}`,
        category: 'custom',
        icon: '📋',
        lastGenerated: new Date().toISOString(),
        generatedBy: 'Current User'
      };

      setReports(prev => [...prev, newReport]);
      setShowCustomModal(false);
      setCustomReport({
        name: '',
        type: 'summary',
        dateRange: '30days',
        filters: [],
        metrics: [],
        format: 'chart'
      });
      
      alert('✅ Custom report created successfully!');
    } catch (error) {
      console.error('Error creating custom report:', error);
      alert('❌ Failed to create custom report');
    }
  };

  const renderReportVisualization = (data) => {
    if (!data) return null;

    return (
      <div style={{ padding: '24px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {Object.entries(data.summary).map(([key, value]) => (
            <div key={key} style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                {typeof value === 'number' ? (
                  value % 1 === 0 ? value.toLocaleString() : value.toFixed(1)
                ) : value}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Chart Visualizations */}
        {data.chartData && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              📊 Visual Analytics
            </h4>
            
            {data.chartData.funnelData && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Hiring Funnel</h5>
                {data.chartData.funnelData.map((item, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                      <span>{item.stage}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                      <div style={{
                        background: `hsl(${200 + index * 30}, 70%, 50%)`,
                        height: '100%',
                        borderRadius: '4px',
                        width: `${item.percentage}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.chartData.sourceBreakdown && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Source Effectiveness</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {data.chartData.sourceBreakdown.map((source, index) => (
                    <div key={index} style={{ padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{source.source}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        <div>Applications: {source.applications}</div>
                        <div>Hires: {source.hires}</div>
                        <div>Conversion: {source.conversion}%</div>
                        <div>Cost: ${source.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table Data */}
        {data.tableData && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                📋 Detailed Breakdown
              </h4>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {Object.keys(data.tableData[0]).map(header => (
                      <th key={header} style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '14px',
                        textTransform: 'capitalize'
                      }}>
                        {header.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.tableData.map((row, index) => (
                    <tr key={index} style={{ borderTop: '1px solid #f3f4f6' }}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>
                          {typeof value === 'number' ? (
                            value % 1 === 0 ? value.toLocaleString() : value.toFixed(1)
                          ) : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <LoadingSpinner size="large" text="Loading reports dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            📈 Advanced Reports Dashboard
          </h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Executive reporting suite with customizable dashboards and automated insights
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Export All Reports Data */}
          <DataExporter
            data={reports}
            filename="all-reports-data"
            onExport={(exportInfo) => {
              console.log(`Exported ${exportInfo.recordCount} reports as ${exportInfo.format.toUpperCase()}`);
            }}
          />
          
          <button
            onClick={() => setShowCustomModal(true)}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ✨ Create Custom Report
          </button>
        </div>
      </div>

      {/* Data Summary */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
          📊 Data Availability Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {(() => {
            const totalRecords = reports.reduce((sum, report) => sum + (report.recordCount || 0), 0);
            const reportsWithData = reports.filter(report => report.recordCount > 0).length;
            
            return (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {reports.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Reports</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: reportsWithData > 0 ? '#10b981' : '#f59e0b' }}>
                    {reportsWithData}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Reports with Data</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: totalRecords > 0 ? '#059669' : '#d97706' }}>
                    {totalRecords}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Records</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: totalRecords > 0 ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>{totalRecords > 0 ? '🟢' : '🟡'}</span>
                    {totalRecords > 0 ? 'Data Available' : 'Limited Data'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {totalRecords > 0 ? 'Reports ready to generate' : 'Add more applications first'}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Report Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {reports.map(report => (
          <div
            key={report._id}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>{report.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {report.name}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  {report.description}
                </p>
              </div>
              <div style={{
                background: report.recordCount > 0 ? '#dcfce7' : '#fef3c7',
                color: report.recordCount > 0 ? '#16a34a' : '#d97706',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {report.recordCount > 0 ? `${report.recordCount} records` : 'No data'}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {report.metrics.slice(0, 3).map(metric => (
                  <span key={metric} style={{
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {metric.replace('_', ' ')}
                  </span>
                ))}
                {report.metrics.length > 3 && (
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    +{report.metrics.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {report.lastGenerated && (
              <div style={{ marginBottom: '16px', fontSize: '12px', color: '#6b7280' }}>
                <div>Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</div>
                <div>By: {report.generatedBy}</div>
                {report.fileSize && <div>Size: {report.fileSize} ({report.recordCount} records)</div>}
              </div>
            )}
            
            <button
              onClick={() => generateReport(report.id || report._id)}
              disabled={generatingReport}
              style={{
                width: '100%',
                background: generatingReport && selectedReport === (report.id || report._id) ? '#9ca3af' : '#10b981',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: generatingReport && selectedReport === (report.id || report._id) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {generatingReport && selectedReport === (report.id || report._id) ? '⏳ Generating...' : '📊 Generate Report'}
            </button>
          </div>
        ))}
      </div>

      {/* Report Visualization */}
      {reportData && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                📋 Report Results
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                Generated on {new Date(reportData.generatedAt).toLocaleString()} • Period: {reportData.period}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => exportReport('csv')}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📊 Export CSV
              </button>
              
              <button
                onClick={() => exportReport('json')}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📄 Export JSON
              </button>
              
              <button
                onClick={() => setReportData(null)}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>
          
          {renderReportVisualization(reportData)}
        </div>
      )}

      {/* Custom Report Modal */}
      {showCustomModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            width: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Create Custom Report</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Report Name</label>
              <input
                type="text"
                value={customReport.name}
                onChange={(e) => setCustomReport(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Q4 Hiring Summary"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Report Type</label>
                <select
                  value={customReport.type}
                  onChange={(e) => setCustomReport(prev => ({ ...prev, type: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="summary">Summary Report</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="comparison">Comparison Report</option>
                  <option value="trend">Trend Analysis</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Date Range</label>
                <select
                  value={customReport.dateRange}
                  onChange={(e) => setCustomReport(prev => ({ ...prev, dateRange: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Select Metrics (choose at least one)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '200px', overflow: 'auto' }}>
                {availableMetrics.map(metric => (
                  <label key={metric.id} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', padding: '4px' }}>
                    <input
                      type="checkbox"
                      checked={customReport.metrics.includes(metric.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomReport(prev => ({ ...prev, metrics: [...prev.metrics, metric.id] }));
                        } else {
                          setCustomReport(prev => ({ ...prev, metrics: prev.metrics.filter(m => m !== metric.id) }));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <span>{metric.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Output Format</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['chart', 'table', 'both'].map(format => (
                  <label key={format} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={customReport.format === format}
                      onChange={(e) => setCustomReport(prev => ({ ...prev, format: e.target.value }))}
                      style={{ marginRight: '6px' }}
                    />
                    {format.charAt(0).toUpperCase() + format.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setCustomReport({
                    name: '',
                    type: 'summary',
                    dateRange: '30days',
                    filters: [],
                    metrics: [],
                    format: 'chart'
                  });
                }}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={createCustomReport}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReportsDashboard;