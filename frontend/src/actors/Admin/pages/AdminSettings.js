import React, { useState } from 'react';
import { FaCog, FaBell, FaLock, FaUser } from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';
import Notification from '../../../components/Notification';
import styles from '../styles/AdminSettings.module.css';  // Make sure this import is correct

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

  const [showAlert, setShowAlert] = useState({ show: false, variant: 'success', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add API call to save settings
    console.log('Settings saved:', settings);
    setShowAlert({
      show: true,
      variant: 'success',
      message: 'Settings saved successfully!'
    });
  };

  return (
    <div className={styles.settingsContainer}>
      <AdminNavbar />
      <div className="dashboard-content">
        {showAlert.show && (
          <Notification
            type={showAlert.variant}
            message={showAlert.message}
            onClose={() => setShowAlert(prev => ({ ...prev, show: false }))}
          />
        )}
        <div className={styles.header}>
          <h1>Admin Settings</h1>
          <p>Manage your admin preferences and system settings</p>
        </div>

        <div className={styles.settingsGrid}>
          {/* General Settings Card */}
          <div className={styles.settingsCard}>
            <h2><FaCog /> General Settings</h2>
            <div className={styles.formGroup}>
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
            <button className={styles.actionButton} onClick={handleSubmit}>Save Changes</button>
          </div>

          {/* Notification Settings Card */}
          <div className={styles.settingsCard}>
            <h2><FaBell /> Notification Settings</h2>
            <div className={styles.switchGroup}>
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
            </div>
          </div>

          {/* Security Settings Card */}
          <div className={styles.settingsCard}>
            <h2><FaLock /> Security Settings</h2>
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
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                />
                Automatic Backup
              </label>
            </div>
          </div>

          {/* Profile Settings Card */}
          <div className={styles.settingsCard}>
            <h2><FaUser /> Profile Settings</h2>
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
      </div>
    </div>
  );
};

export default AdminSettings;
