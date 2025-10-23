import React, { useState } from 'react';

const AdvancedSearch = ({ onSearch, placeholder = "Search applications..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    position: 'all',
    dateRange: 'all',
    score: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (term = searchTerm, currentFilters = filters) => {
    onSearch({
      searchTerm: term,
      filters: currentFilters
    });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    handleSearch(searchTerm, newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      status: 'all',
      position: 'all',
      dateRange: 'all',
      score: 'all'
    };
    setFilters(resetFilters);
    setSearchTerm('');
    handleSearch('', resetFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Main Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              ':focus': {
                borderColor: '#3b82f6'
              }
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
            color: '#6b7280'
          }}>
            🔍
          </span>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '12px 16px',
            background: showAdvanced ? '#3b82f6' : '#f3f4f6',
            color: showAdvanced ? 'white' : '#374151',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          ⚙️ Filters
          {activeFiltersCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          borderTop: '1px solid #f3f4f6',
          paddingTop: '16px',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                STATUS
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#fff'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Position Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                POSITION
              </label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#fff'
                }}
              >
                <option value="all">All Positions</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                DATE RANGE
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#fff'
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            {/* Score Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                SCORE RANGE
              </label>
              <select
                value={filters.score}
                onChange={(e) => handleFilterChange('score', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#fff'
                }}
              >
                <option value="all">All Scores</option>
                <option value="90-100">90-100 (Excellent)</option>
                <option value="80-89">80-89 (Good)</option>
                <option value="70-79">70-79 (Average)</option>
                <option value="60-69">60-69 (Below Average)</option>
                <option value="0-59">0-59 (Poor)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedSearch;