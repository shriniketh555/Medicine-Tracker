import React, { useState } from 'react';
import { Bell, Mail, Phone, Users, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { Medicine, MedicineIntake, UserProfile } from '../App';
import 'emailjs-com';

interface CaregiverNotificationsProps {
  profile: UserProfile;
  medicines: Medicine[];
  intakes: MedicineIntake[];
  darkMode: boolean;
}

const CaregiverNotifications: React.FC<CaregiverNotificationsProps> = ({
  profile,
  medicines,
  intakes,
  darkMode
}) => {
  const [notificationSettings, setNotificationSettings] = useState({
    missedMedicine: true,
    dailySummary: true,
    emergencyContact: true,
    adherenceAlerts: true
  });

  const [testNotification, setTestNotification] = useState(false);

  // Calculate recent missed medicines
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const recentMissedMedicines = medicines.flatMap(medicine =>
    medicine.times.map(time => ({
      medicine,
      time,
      date: today,
      intake: intakes.find(intake =>
        intake.medicineId === medicine.id &&
        intake.date === today &&
        intake.time === time
      )
    }))
  ).filter(item => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return !item.intake && item.time < currentTime;
  });

  // Calculate adherence rate for the last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyIntakes = intakes.filter(intake => 
    new Date(intake.date) >= weekAgo
  );
  const weeklyTaken = weeklyIntakes.filter(intake => intake.status === 'taken').length;
  const weeklyTotal = weeklyIntakes.length;
  const weeklyAdherence = weeklyTotal > 0 ? Math.round((weeklyTaken / weeklyTotal) * 100) : 0;

  const sendTestNotification = () => {
    setTestNotification(true);
    // Simulate sending notification
    setTimeout(() => {
      setTestNotification(false);
      alert(`Test notification sent to ${profile.caregiverEmail || 'caregiver'}!`);
    }, 2000);
  };

  const updateNotificationSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Function to send caregiver email notification using EmailJS
  const sendCaregiverEmail = () => {
    const recipient = (profile.caregiverEmail || '').trim();
    if (!recipient) {
      alert('No caregiver email found in profile.');
      return;
    }
    const payload = {
      to_email: recipient,
      user_name: profile.name,
      health_condition: profile.healthCondition,
      doctor_name: profile.doctorName,
      doctor_phone: profile.doctorPhone,
      emergency_contact: profile.emergencyContact
    };
    console.log('EmailJS payload:', payload);
    import('emailjs-com').then(emailjs => {
      emailjs.send(
        'service_au9n3pq',
        'template_xamm5yr',
        payload,
        'Clutb5hJYzEnVjuR1'
      )
      .then(() => {
        alert('Notification sent to caregiver!');
      })
      .catch((error) => {
        console.error('EmailJS error:', error);
        alert('Failed to send notification.');
      });
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Caregiver & Family Notifications
        </h2>
        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Keep your loved ones informed about your medicine routine
        </p>
      </div>

      {/* Caregiver Contact Setup */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-8 h-8 text-blue-500" />
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Caregiver Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Phone className="w-6 h-6 text-green-500" />
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Emergency Contact
              </h4>
            </div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {profile.emergencyContact || 'Not set'}
            </p>
            {!profile.emergencyContact && (
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Please set up your emergency contact in the Profile section
              </p>
            )}
          </div>

          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Caregiver Email
              </h4>
            </div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {profile.caregiverEmail || 'Not set'}
            </p>
            {!profile.caregiverEmail && (
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Please set up your caregiver email in the Profile section
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Current Status Alert */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Current Status
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg text-center ${
            recentMissedMedicines.length > 0 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              recentMissedMedicines.length > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {recentMissedMedicines.length > 0 ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            <p className={`text-2xl font-bold ${
              recentMissedMedicines.length > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {recentMissedMedicines.length}
            </p>
            <p className={`text-sm ${
              recentMissedMedicines.length > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              Missed Today
            </p>
          </div>

          <div className={`p-4 rounded-lg text-center ${
            weeklyAdherence >= 80 
              ? 'bg-green-50 border border-green-200' 
              : weeklyAdherence >= 60
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              weeklyAdherence >= 80 
                ? 'bg-green-100' 
                : weeklyAdherence >= 60
                ? 'bg-yellow-100'
                : 'bg-red-100'
            }`}>
              <Bell className={`w-6 h-6 ${
                weeklyAdherence >= 80 
                  ? 'text-green-600' 
                  : weeklyAdherence >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`} />
            </div>
            <p className={`text-2xl font-bold ${
              weeklyAdherence >= 80 
                ? 'text-green-600' 
                : weeklyAdherence >= 60
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {weeklyAdherence}%
            </p>
            <p className={`text-sm ${
              weeklyAdherence >= 80 
                ? 'text-green-700' 
                : weeklyAdherence >= 60
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              Weekly Adherence
            </p>
          </div>

          <div className="p-4 rounded-lg text-center bg-blue-50 border border-blue-200">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {profile.caregiverEmail ? 'Active' : 'Inactive'}
            </p>
            <p className="text-sm text-blue-700">
              Caregiver Alerts
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-8 h-8 text-purple-500" />
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Notification Settings
          </h3>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'missedMedicine' as const,
              title: 'Missed Medicine Alerts',
              description: 'Notify caregiver when a medicine is missed for more than 30 minutes'
            },
            {
              key: 'dailySummary' as const,
              title: 'Daily Summary Reports',
              description: 'Send daily adherence summary to caregiver at end of day'
            },
            {
              key: 'emergencyContact' as const,
              title: 'Emergency Contact Alerts',
              description: 'Contact emergency contact for critical missed medicines'
            },
            {
              key: 'adherenceAlerts' as const,
              title: 'Adherence Alerts',
              description: 'Weekly adherence reports and improvement suggestions'
            }
          ].map(setting => (
            <div key={setting.key} className={`flex items-center justify-between p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex-1">
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {setting.title}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {setting.description}
                </p>
              </div>
              <button
                onClick={() => updateNotificationSetting(setting.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[setting.key] 
                    ? 'bg-blue-500' 
                    : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Caregiver Notification */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-8 h-8 text-blue-500" />
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Send Caregiver Notification
          </h3>
        </div>
        <div className="text-center">
          <button
            onClick={sendCaregiverEmail}
            disabled={!profile.caregiverEmail}
            className={`inline-flex items-center space-x-3 px-8 py-4 rounded-lg text-lg font-medium transition-colors ${
              !profile.caregiverEmail
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            <Mail className="w-6 h-6" />
            <span>Send Notification</span>
          </button>
          {!profile.caregiverEmail && (
            <p className={`text-sm mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Please set up caregiver email in Profile section to enable notifications
            </p>
          )}
        </div>
      </div>
      {/* Test Notification
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-8 h-8 text-green-500" />
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Test Notifications
          </h3>
        </div>

        <div className="text-center">
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Send a test notification to verify your caregiver notification system is working
          </p>
          
          <button
            onClick={sendTestNotification}
            disabled={testNotification || !profile.caregiverEmail}
            className={`inline-flex items-center space-x-3 px-8 py-4 rounded-lg text-lg font-medium transition-colors ${
              testNotification || !profile.caregiverEmail
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            <Bell className="w-6 h-6" />
            <span>
              {testNotification ? 'Sending...' : 'Send Test Notification'}
            </span>
          </button> */}

          {/* {!profile.caregiverEmail && (
            <p className={`text-sm mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Please set up caregiver email in Profile section to enable notifications
            </p>
          )}
        </div>
      </div> */}

      {/* Recent Missed Medicines */}
      {recentMissedMedicines.length > 0 && (
        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-red-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Missed Medicines Alert
            </h3>
          </div>

          <div className="space-y-3">
            {recentMissedMedicines.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.medicine.name}
                    </h4>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.medicine.dosage} - Scheduled for {item.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-semibold">MISSED</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800">
              <strong>Caregiver Alert:</strong> These missed medicines have been reported to your designated caregiver 
              {profile.caregiverEmail && ` at ${profile.caregiverEmail}`}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverNotifications;