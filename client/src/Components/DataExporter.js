import React, { useState } from 'react';

const DataExporter = ({ data = [], filename = 'export', onExport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showModal, setShowModal] = useState(false);

  const exportFormats = [
    { id: 'csv', name: 'CSV', icon: '📊', description: 'Comma-separated values' },
    { id: 'json', name: 'JSON', icon: '📋', description: 'JavaScript Object Notation' },
    { id: 'pdf', name: 'PDF', icon: '📄', description: 'Portable Document Format' },
    { id: 'excel', name: 'Excel', icon: '📈', description: 'Microsoft Excel format' }
  ];

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content, mimeType, fileExtension;
      
      switch (exportFormat) {
        case 'csv':
          content = convertToCSV(data);
          mimeType = 'text/csv';
          fileExtension = '.csv';
          break;
          
        case 'json':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          fileExtension = '.json';
          break;
          
        case 'pdf':
          // For PDF, you'd typically use a library like jsPDF
          alert('PDF export feature coming soon!');
          setIsExporting(false);
          return;
          
        case 'excel':
          // For Excel, you'd typically use a library like xlsx
          alert('Excel export feature coming soon!');
          setIsExporting(false);
          return;
          
        default:
          content = convertToCSV(data);
          mimeType = 'text/csv';
          fileExtension = '.csv';
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = `${filename}_${timestamp}${fileExtension}`;
      
      downloadFile(content, finalFilename, mimeType);
      
      if (onExport) {
        onExport({
          format: exportFormat,
          recordCount: data.length,
          filename: finalFilename
        });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={!data.length}
        style={{
          background: data.length ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#9ca3af',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: data.length ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        📊 Export ({data.length})
      </button>

      {/* Export Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827'
              }}>
                📊 Export Data
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Export {data.length} records in your preferred format
              </p>
            </div>

            {/* Format Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Select Export Format:
              </label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {exportFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    style={{
                      padding: '16px',
                      border: `2px solid ${exportFormat === format.id ? '#3b82f6' : '#e5e7eb'}`,
                      background: exportFormat === format.id ? '#eff6ff' : 'white',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '20px' }}>{format.icon}</span>
                      <span style={{ fontWeight: '600', color: '#111827' }}>{format.name}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {format.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Export Preview:
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                📁 Filename: {filename}_{new Date().toISOString().split('T')[0]}.{exportFormat}
                <br />
                📊 Records: {data.length}
                <br />
                📅 Date: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={isExporting}
                style={{
                  padding: '12px 20px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  background: isExporting ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isExporting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Exporting...
                  </>
                ) : (
                  <>📊 Export {exportFormat.toUpperCase()}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default DataExporter;