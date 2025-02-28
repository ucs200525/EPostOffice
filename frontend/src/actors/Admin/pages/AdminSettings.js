import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteTitle: 'E-Post Office',
    emailServer: 'smtp.epost.com',
    maintenanceMode: false,
    notifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    theme: 'light',
    maxFileSize: 10,
    defaultCurrency: 'INR',
    timeZone: 'Asia/Kolkata'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add API call to save settings
    console.log('Settings saved:', settings);
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>System Settings</h1>
            <p>Configure your E-Post Office system settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-container">
          <div className="settings-grid">
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="form-group">
                <label>Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email Server</label>
                <input
                  type="text"
                  value={settings.emailServer}
                  onChange={(e) => setSettings({...settings, emailServer: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({...settings, theme: e.target.value})}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>System Preferences</h3>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  />
                  Maintenance Mode
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  />
                  Enable Notifications
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                  />
                  Automatic Backup
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3>Regional Settings</h3>
              <div className="form-group">
                <label>Default Currency</label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({...settings, defaultCurrency: e.target.value})}
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time Zone</label>
                <select
                  value={settings.timeZone}
                  onChange={(e) => setSettings({...settings, timeZone: e.target.value})}
                >
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">New York (EST)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Save Changes</button>
            <button type="button" className="btn-secondary">Reset to Default</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
