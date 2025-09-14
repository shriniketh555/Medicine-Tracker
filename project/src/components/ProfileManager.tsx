import React from 'react';
import { User, Phone, UserCheck, Save } from 'lucide-react';
import { UserProfile } from '../App';

interface ProfileManagerProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  darkMode: boolean;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ profile, setProfile, darkMode }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Profile is automatically saved via useEffect in App.tsx
    alert('Profile saved successfully!');
  };

  const updateField = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Management</h2>
        <p className={`text-xl mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your personal information and emergency contacts</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className={`rounded-xl shadow-lg p-8 space-y-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <User className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                <User className="w-5 h-5 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Age *
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={profile.age || ''}
                onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your age"
              />
            </div>
          </div>

          {/* Health Condition */}
          <div>
            <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Health Condition
            </label>
            <input
              type="text"
              value={profile.healthCondition}
              onChange={(e) => updateField('healthCondition', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., Diabetes, Hypertension, Heart Disease"
            />
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Optional: This helps caregivers understand your medical context
            </p>
          </div>

          {/* Emergency Contact */}
          <div className="border-t pt-6">
            <h4 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Phone className="w-6 h-6 mr-2 text-red-500" />
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={profile.emergencyContact}
                onChange={(e) => updateField('emergencyContact', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                placeholder="e.g., +1 (555) 123-4567"
              />
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This contact will be used in case of emergency or missed medications
              </p>
              </div>

              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Caregiver Email
                </label>
                <input
                  type="email"
                  value={profile.caregiverEmail}
                  onChange={(e) => updateField('caregiverEmail', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="caregiver@example.com"
                />
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Email for daily reports and missed medicine alerts
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="border-t pt-6">
            <h4 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <UserCheck className="w-6 h-6 mr-2 text-green-500" />
              Doctor Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Doctor's Name
                </label>
                <input
                  type="text"
                  value={profile.doctorName}
                  onChange={(e) => updateField('doctorName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Dr. Smith"
                />
              </div>

              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Doctor's Phone
                </label>
                <input
                  type="tel"
                  value={profile.doctorPhone}
                  onChange={(e) => updateField('doctorPhone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-3 bg-blue-500 text-white px-8 py-4 rounded-lg text-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Save className="w-6 h-6" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        {/* Profile Summary */}
        {profile.name && (
          <div className={`mt-8 rounded-xl p-6 border ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
              : 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200'
          }`}>
            <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Summary</h4>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <strong>Name:</strong> {profile.name}
              </div>
              <div>
                <strong>Age:</strong> {profile.age} years old
              </div>
              {profile.healthCondition && (
                <div>
                  <strong>Health Condition:</strong> {profile.healthCondition}
                </div>
              )}
              <div>
                <strong>Emergency Contact:</strong> {profile.emergencyContact || 'Not set'}
              </div>
              <div>
                <strong>Caregiver Email:</strong> {profile.caregiverEmail || 'Not set'}
              </div>
              <div>
                <strong>Doctor:</strong> {profile.doctorName || 'Not set'}
              </div>
            </div>
            {profile.doctorPhone && (
              <div className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Doctor's Phone:</strong> {profile.doctorPhone}
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`mt-8 rounded-xl p-6 border ${
          darkMode 
            ? 'bg-yellow-900/20 border-yellow-800' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>💡 Profile Tips</h4>
          <ul className={`space-y-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
            <li>• Keep your emergency contact information up to date</li>
            <li>• Set up caregiver email for automatic notifications about missed medicines</li>
            <li>• Share this app with your family members for better care coordination</li>
            <li>• Regular check-ins with your doctor help optimize your medication schedule</li>
            <li>• Include your health condition to help caregivers provide better support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;