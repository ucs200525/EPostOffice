import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-content">
        <h2>Reports</h2>
        <div className="report-controls">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="report-select"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
          
          <div className="date-range">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <input 
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          
          <button className="admin-btn">Generate Report</button>
        </div>

        <div className="report-sections">
          <div className="report-card">
            <h3>Revenue Overview</h3>
            {/* Add revenue charts/data here */}
          </div>
          
          <div className="report-card">
            <h3>Staff Performance</h3>
            {/* Add staff performance metrics here */}
          </div>
          
          <div className="report-card">
            <h3>Service Usage</h3>
            {/* Add service usage statistics here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
