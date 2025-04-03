import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import styles from '../styles/Profile.module.css';
import Notification from '../../../components/Notification';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!user || !user.id) {
        console.log('No user ID available');
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/customer/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    }
  };

  return (
    <div className={styles.profileContainer}>
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {profile && (
        <div className={styles.profileContent}>
          <h1>Profile</h1>
          <div className={styles.profileInfo}>
            <div className={styles.infoGroup}>
              <label>Name</label>
              <p>{profile.name}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Phone</label>
              <p>{profile.phone}</p>
            </div>
            {/* Add more profile fields as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;