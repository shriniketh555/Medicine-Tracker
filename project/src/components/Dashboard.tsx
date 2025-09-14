import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Medicine, MedicineIntake, UserProfile } from '../App';

interface DashboardProps {
  medicines: Medicine[];
  intakes: MedicineIntake[];
  profile: UserProfile;
  updateIntakeStatus: (medicineId: string, date: string, time: string, status: 'taken' | 'skipped') => void;
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ medicines, intakes, profile, updateIntakeStatus, darkMode }) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Calculate today's medicine schedule
  const todaysSchedule = medicines.flatMap(medicine =>
    medicine.times.map(time => ({
      medicine,
      time,
      intake: intakes.find(intake =>
        intake.medicineId === medicine.id &&
        intake.date === today &&
        intake.time === time
      )
    }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Calculate stats
  const totalToday = todaysSchedule.length;
  const takenToday = todaysSchedule.filter(item => item.intake?.status === 'taken').length;
  const skippedToday = todaysSchedule.filter(item => item.intake?.status === 'skipped').length;
  const missedToday = todaysSchedule.filter(item => {
    if (item.intake) return item.intake.status === 'missed';
    return item.time < currentTime;
  }).length;

  const upcomingMedicines = todaysSchedule.filter(item => 
    !item.intake && item.time >= currentTime
  ).slice(0, 3);

  // Calculate weekly adherence
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  // Removed unused weeklyIntakes variable
  const adherenceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Today's Medicine Dashboard
        </h2>
        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
          })}
        </p>
        {profile.name && (
          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Patient:</strong> {profile.name} ({profile.age} years old)
            </p>
            {profile.healthCondition && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Condition:</strong> {profile.healthCondition}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-green-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Taken Today</p>
              <p className="text-3xl font-bold text-green-600">{takenToday}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Skipped Today</p>
              <p className="text-3xl font-bold text-yellow-600">{skippedToday}</p>
            </div>
            <XCircle className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-red-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Missed Today</p>
              <p className="text-3xl font-bold text-red-600">{missedToday}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-blue-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adherence Rate</p>
              <p className="text-3xl font-bold text-blue-600">{adherenceRate}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Medicines */}
        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-8 h-8 text-blue-500" />
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Next Medicine Reminder
            </h3>
          </div>
          {upcomingMedicines.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                All medicines taken for now!
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Great job staying on track</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMedicines.map((item) => (
                <div key={`${item.medicine.id}-${item.time}`} 
                     className={`flex items-center justify-between p-4 rounded-lg border ${
                       darkMode 
                         ? 'bg-blue-900/30 border-blue-700' 
                         : 'bg-blue-50 border-blue-200'
                     }`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.medicine.name}
                        </h4>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {item.medicine.dosage}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.medicine.instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{item.time}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.time === currentTime ? 'Now!' : 'Coming up'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Today's Progress Tracker
            </h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todaysSchedule.map((item) => {
              const status = item.intake?.status || (item.time < currentTime ? 'missed' : 'pending');
              const statusConfig = {
                taken: { color: 'green', icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200' },
                skipped: { color: 'yellow', icon: XCircle, bg: 'bg-yellow-50', border: 'border-yellow-200' },
                missed: { color: 'red', icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-200' },
                pending: { color: 'blue', icon: Clock, bg: 'bg-blue-50', border: 'border-blue-200' }
              }[status];

              const StatusIcon = statusConfig.icon;

              return (
                <div key={`${item.medicine.id}-${item.time}`} 
                     className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                       darkMode 
                         ? `bg-gray-700 border-gray-600` 
                         : `${statusConfig.bg} ${statusConfig.border}`
                     }`}>
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-6 h-6 text-${statusConfig.color}-500`} />
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.medicine.name}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.medicine.dosage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.time}</p>
                    {status === 'pending' && (
                      <div className="flex space-x-2 mt-1">
                        <button
                          onClick={() => updateIntakeStatus(item.medicine.id, today, item.time, 'taken')}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                          Take
                        </button>
                        <button
                          onClick={() => updateIntakeStatus(item.medicine.id, today, item.time, 'skipped')}
                          className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {totalToday === 0 && (
        <div className={`rounded-xl shadow-lg p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No medicines scheduled for today
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Add your medicines to start tracking your daily intake
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;