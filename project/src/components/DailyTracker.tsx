import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Medicine, MedicineIntake } from '../App';

interface DailyTrackerProps {
  medicines: Medicine[];
  intakes: MedicineIntake[];
  updateIntakeStatus: (medicineId: string, date: string, time: string, status: 'taken' | 'skipped') => void;
  darkMode: boolean;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({ medicines, intakes, updateIntakeStatus, darkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Get medicines for selected date
  const dailySchedule = medicines.flatMap(medicine =>
    medicine.times.map(time => ({
      medicine,
      time,
      intake: intakes.find(intake =>
        intake.medicineId === medicine.id &&
        intake.date === selectedDate &&
        intake.time === time
      )
    }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  const getStatusInfo = (item: typeof dailySchedule[0]) => {
    if (item.intake) {
      return {
        status: item.intake.status,
        canModify: true
      };
    }
    
    if (isToday && item.time > currentTime) {
      return {
        status: 'pending' as const,
        canModify: true
      };
    }
    
    return {
      status: 'missed' as const,
      canModify: selectedDate >= new Date().toISOString().split('T')[0]
    };
  };

  const statusConfig = {
    taken: { 
      color: 'green', 
      icon: CheckCircle, 
      bg: 'bg-green-50', 
      border: 'border-green-200',
      text: 'text-green-700',
      label: 'Taken'
    },
    skipped: { 
      color: 'yellow', 
      icon: XCircle, 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      label: 'Skipped'
    },
    missed: { 
      color: 'red', 
      icon: AlertTriangle, 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      text: 'text-red-700',
      label: 'Missed'
    },
    pending: { 
      color: 'blue', 
      icon: Calendar, 
      bg: 'bg-blue-50', 
      border: 'border-blue-200',
      text: 'text-blue-700',
      label: 'Pending'
    }
  };

  // Calculate daily stats
  const totalMedicines = dailySchedule.length;
  const takenCount = dailySchedule.filter(item => getStatusInfo(item).status === 'taken').length;
  const skippedCount = dailySchedule.filter(item => getStatusInfo(item).status === 'skipped').length;
  const missedCount = dailySchedule.filter(item => getStatusInfo(item).status === 'missed').length;
  const adherenceRate = totalMedicines > 0 ? Math.round((takenCount / totalMedicines) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header with Date Navigation */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Daily Medicine Tracker</h2>
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Today
            </button>
          )}
        </div>

        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={goToPreviousDay}
            className={`p-3 rounded-full transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`text-2xl font-bold bg-transparent border-none text-center cursor-pointer rounded-lg p-2 transition-colors ${
                darkMode 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            />
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {isToday && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Today</span>}
            </p>
          </div>

          <button
            onClick={goToNextDay}
            className={`p-3 rounded-full transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-green-900/30' : 'bg-green-50'
          }`}>
            <p className="text-2xl font-bold text-green-600">{takenCount}</p>
            <p className={`${darkMode ? 'text-green-400' : 'text-green-700'}`}>Taken</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
          }`}>
            <p className="text-2xl font-bold text-yellow-600">{skippedCount}</p>
            <p className={`${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Skipped</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-red-900/30' : 'bg-red-50'
          }`}>
            <p className="text-2xl font-bold text-red-600">{missedCount}</p>
            <p className={`${darkMode ? 'text-red-400' : 'text-red-700'}`}>Missed</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <p className="text-2xl font-bold text-blue-600">{adherenceRate}%</p>
            <p className={`${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Adherence</p>
          </div>
        </div>
      </div>

      {/* Medicine Schedule */}
      <div className="space-y-4">
        {dailySchedule.length === 0 ? (
          <div className={`rounded-xl shadow-lg p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No medicines scheduled</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No medicines are scheduled for this date</p>
          </div>
        ) : (
          dailySchedule.map((item, index) => {
            const statusInfo = getStatusInfo(item);
            const config = statusConfig[statusInfo.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={`${item.medicine.id}-${item.time}`}
                className={`rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow ${
                  darkMode ? 'bg-gray-800 border-gray-600' : `bg-white ${config.bg} ${config.border}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : config.bg}`}>
                      <StatusIcon className={`w-8 h-8 text-${config.color}-600`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.medicine.name}</h3>
                      <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.medicine.dosage}</p>
                      {item.medicine.instructions && (
                        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.medicine.instructions}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.time}</p>
                    <p className={`text-lg font-semibold ${config.text}`}>{config.label}</p>
                    
                    {statusInfo.canModify && statusInfo.status !== 'taken' && (
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => updateIntakeStatus(item.medicine.id, selectedDate, item.time, 'taken')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          Mark Taken
                        </button>
                        <button
                          onClick={() => updateIntakeStatus(item.medicine.id, selectedDate, item.time, 'skipped')}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                        >
                          Mark Skipped
                        </button>
                      </div>
                    )}
                    
                    {statusInfo.status === 'taken' && item.intake && (
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Recorded: {new Date(item.intake.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyTracker;