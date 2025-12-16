// src/pages/MemberLogin.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemberLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithCode, loading, error } = useAuth();

  // Détecter si on a un code de connexion en paramètre
  const initialCode = searchParams.get('code') || '';
  
  const [loginMode, setLoginMode] = useState(initialCode ? 'code' : 'password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    loginCode: initialCode,
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur pour ce champ quand l'utilisateur tape
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (loginMode === 'password') {
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (!formData.password) errors.password = 'Password is required';
      if (formData.email && !formData.email.includes('@')) {
        errors.email = 'Invalid email address';
      }
    } else {
      if (!formData.loginCode.trim()) errors.loginCode = 'Login code is required';
      if (!formData.newPassword) errors.newPassword = 'Password is required';
      if (formData.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    let result;
    
    if (loginMode === 'password') {
      result = await login(formData.email, formData.password);
    } else {
      result = await loginWithCode(
        formData.loginCode,
        formData.newPassword,
        formData.confirmPassword
      );
    }

    if (result.success) {
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/member/dashboard');
      }, 1500);
    }
  };

  const toggleMode = () => {
    setLoginMode(loginMode === 'password' ? 'code' : 'password');
    setValidationErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Member Portal</h1>
          <p className="text-slate-400">Access your professional profile</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{successMessage}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login Mode Toggle */}
            <div className="flex gap-2 mb-6 p-2 bg-slate-700/50 rounded-lg">
              <button
                type="button"
                onClick={() => loginMode !== 'password' && toggleMode()}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  loginMode === 'password'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => loginMode !== 'code' && toggleMode()}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  loginMode === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Login Code
              </button>
            </div>

            {/* Password Mode */}
            {loginMode === 'password' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@trugroup.cm"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                        validationErrors.email ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                        validationErrors.password ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Code Mode */}
            {loginMode === 'code' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Login Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Login Code
                  </label>
                  <input
                    type="text"
                    name="loginCode"
                    value={formData.loginCode}
                    onChange={handleInputChange}
                    placeholder="ABC123DEF456"
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition uppercase ${
                      validationErrors.loginCode ? 'border-red-500' : 'border-slate-600'
                    }`}
                  />
                  {validationErrors.loginCode && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.loginCode}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-2">
                    You received this code from the administrator
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                        validationErrors.newPassword ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-400"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.newPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                        validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-400"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <p className="text-slate-400 text-sm">
              <strong>First time?</strong> Use the login code sent by your administrator and create your password.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Back to <a href="/" className="text-blue-400 hover:text-blue-300">website</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
