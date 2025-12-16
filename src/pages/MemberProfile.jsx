// src/pages/MemberProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { 
  LogOut, Edit2, Save, X, Upload, Mail, Phone, Briefcase, 
  Linkedin, FileText, Award, Plus, Loader, AlertCircle, CheckCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemberProfile() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { profile, loading, error, fetchProfile, updateProfile, uploadPhoto } = useMemberProfile(user?.memberId, token);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/member/login');
      return;
    }
    fetchProfile();
  }, [user, token]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        linkedin: profile.linked_in || '',
        specialties: profile.specialties || [],
        certifications: profile.certifications || []
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPhotoPreview(evt.target?.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingPhoto(true);
    const result = await uploadPhoto(file);
    setUploadingPhoto(false);

    if (result.success) {
      setSuccessMessage('Photo uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleAddSpecialty = (specialty) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleAddCertification = (cert) => {
    if (cert && !formData.certifications.includes(cert)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert]
      }));
    }
  };

  const handleRemoveCertification = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/member/login');
  };

  if (!user) {
    return null;
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 mt-1">Manage your professional information</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400">{successMessage}</p>
          </motion.div>
        )}

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              {/* Header avec photo */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-600 relative">
                <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                  <div className="relative">
                    <img
                      src={photoPreview || profile.image || 'https://via.placeholder.com/120?text=Profile'}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full border-4 border-slate-800 object-cover"
                    />
                    {isEditing && (
                      <label className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-all">
                        <Upload className="w-5 h-5 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="pt-20 px-8 pb-8">
                {/* Top Info */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="text-2xl font-bold text-white bg-slate-700 px-4 py-2 rounded-lg mb-2 w-full"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
                    )}
                    
                    {isEditing ? (
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Your position"
                        className="text-blue-400 font-semibold bg-slate-700 px-4 py-2 rounded-lg w-full"
                      />
                    ) : (
                      <p className="text-blue-400 font-semibold">{profile.title}</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleSave();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-all font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="w-5 h-5" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-5 h-5" />
                        Edit
                      </>
                    )}
                  </button>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-slate-700">
                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <p className="text-white bg-slate-700 px-4 py-2 rounded-lg">{profile.profile?.email}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-white bg-slate-700 px-4 py-2 rounded-lg">{profile.phone || 'Not provided'}</p>
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full bg-slate-700 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <a
                        href={profile.linked_in}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {profile.linked_in || 'Not provided'}
                      </a>
                    )}
                  </div>
                </div>

                {/* Bio/Description */}
                <div className="mb-8">
                  <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-2">
                    <FileText className="w-4 h-4" />
                    Bio or Description
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="w-full h-32 bg-slate-700 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <p className="text-slate-300 bg-slate-700 px-4 py-2 rounded-lg whitespace-pre-wrap">
                      {profile.bio || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Specialties */}
                <div className="mb-8">
                  <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
                    <Briefcase className="w-4 h-4" />
                    Specialties
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.specialties?.map((specialty, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-600/20 border border-blue-600/50 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {specialty}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSpecialty(specialty)}
                            className="hover:text-blue-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a specialty..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSpecialty(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 bg-slate-700 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          const input = event.currentTarget.previousElementSibling;
                          handleAddSpecialty(input.value);
                          input.value = '';
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
                    <Award className="w-4 h-4" />
                    Certifications & Awards
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.certifications?.map((cert, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-600/20 border border-amber-600/50 text-amber-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {cert}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveCertification(cert)}
                            className="hover:text-amber-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a certification..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCertification(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 bg-slate-700 px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          const input = event.currentTarget.previousElementSibling;
                          handleAddCertification(input.value);
                          input.value = '';
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
