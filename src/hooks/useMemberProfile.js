// src/hooks/useMemberProfile.js
import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://tru-backend-o1zc.onrender.com';

export function useMemberProfile(memberId, token) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!memberId || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/members/${memberId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
      
      setProfile(data.member);
      return data.member;
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch profile';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [memberId, token]);

  const updateProfile = useCallback(async (updatedData) => {
    if (!memberId || !token) return { success: false, error: 'Missing data' };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/members/${memberId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      setProfile(data.member);
      return { success: true, member: data.member };
    } catch (err) {
      const errorMsg = err.message || 'Failed to update profile';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [memberId, token]);

  const uploadPhoto = useCallback(async (file) => {
    if (!memberId || !token || !file) {
      return { success: false, error: 'Missing data' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch(`${API_URL}/api/members/${memberId}/photo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }
      
      // Mettre à jour le profil avec la nouvelle image
      if (profile) {
        setProfile({ ...profile, image: data.member.image });
      }
      
      return { success: true, imageUrl: data.member.image };
    } catch (err) {
      const errorMsg = err.message || 'Failed to upload photo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [memberId, token, profile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadPhoto
  };
}
