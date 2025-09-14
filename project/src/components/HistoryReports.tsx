import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Download, FileText, BarChart3, PieChart } from 'lucide-react';
import { Medicine, MedicineIntake, UserProfile } from '../App';

interface HistoryReportsProps {
  medicines: Medicine[];
  intakes: MedicineIntake[];
  profile: UserProfile;
  exportData: (format: 'pdf' | 'csv') => void;
  darkMode: boolean;
}

const HistoryReports: React.FC<HistoryReportsProps> = ({ 
  medicines, 
  intakes, 
  profile, 
  exportData, 
  darkMode 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('all');

  // Calculate date ranges
  const getDateRange = (period: string) => {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setDate(end.getDate() - 30);
        break;
      case 'quarter':
        start.setDate(end.getDate() - 90);
        break;
    }
    
    return { start, end };
  };

  const { start: startDate, end: endDate } = getDateRange(selectedPeriod);

  // Filter intakes by date range and medicine
  const filteredIntakes = useMemo(() => {
    return intakes.filter(intake => {
      const intakeDate = new Date(intake.date);
      const inDateRange = intakeDate >= startDate && intakeDate <= endDate;
      const matchesMedicine = selectedMedicine === 'all' || intake.medicineId === selectedMedicine;
      return inDateRange && matchesMedicine;
    });
  }, [intakes, startDate, endDate, selectedMedicine]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredIntakes.length;
    const taken = filteredIntakes.filter(i => i.status === 'taken').length;
    const skipped = filteredIntakes.filter(i => i.status === 'skipped').length;
    const missed = filteredIntakes.filter(i => i.status === 'missed').length;
    
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;
    
    // Daily adherence over time
    const dailyStats = new Map<string, { taken: number; total: number }>();
    
    filteredIntakes.forEach(intake => {
      const date = intake.date;
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { taken: 0, total: 0 });
      }
      const dayStats = dailyStats.get(date)!;
      dayStats.total++;
      if (intake.status === 'taken') {
        dayStats.taken++;
      }
    });

    // Medicine-specific stats
    const medicineStats = new Map<string, { taken: number; total: number; name: string }>();
    
    filteredIntakes.forEach(intake => {
      const medicine = medicines.find(m => m.id === intake.medicineId);
      if (medicine) {
        if (!medicineStats.has(intake.medicineId)) {
          medicineStats.set(intake.medicineId, { taken: 0, total: 0, name: medicine.name });
        }
        const medStats = medicineStats.get(intake.medicineId)!;
        medStats.total++;
        if (intake.status === 'taken') {
          medStats.taken++;
        }
      }
    });

    return {
      total,
      taken,
      skipped,
      missed,
      adherenceRate,
      dailyStats: Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date,
        adherence: Math.round((stats.taken / stats.total) * 100)
      })).sort((a, b) => a.date.localeCompare(b.date)),
      medicineStats: Array.from(medicineStats.entries()).map(([id, stats]) => ({
        id,
        name: stats.name,
        adherence: Math.round((stats.taken / stats.total) * 100),
        taken: stats.taken,
        total: stats.total
      }))
    };
  }, [filteredIntakes, medicines]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Medicine History & Reports
        </h2>
        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Track your medicine adherence over time
        </p>
      </div>

      {/* Controls */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>

          <div>
            <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Medicine Filter
            </label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Medicines</option>
              {medicines.map(medicine => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Export Reports
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => exportData('csv')}
                className="flex items-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => exportData('pdf')}
                className="flex items-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-blue-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overall Adherence</p>
              <p className="text-3xl font-bold text-blue-600">{stats.adherenceRate}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-green-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Doses Taken</p>
              <p className="text-3xl font-bold text-green-600">{stats.taken}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Doses Skipped</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.skipped}</p>
            </div>
            <PieChart className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 border-l-4 border-red-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Doses Missed</p>
              <p className="text-3xl font-bold text-red-600">{stats.missed}</p>
            </div>
            <Calendar className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Daily Adherence Chart */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Daily Adherence Trend
        </h3>
        <div className="space-y-3">
          {stats.dailyStats.length === 0 ? (
            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No data available for the selected period
            </p>
          ) : (
            stats.dailyStats.map(day => (
              <div key={day.date} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1">
                  <div className={`h-6 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                      style={{ width: `${day.adherence}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right font-semibold">
                  {day.adherence}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Medicine-Specific Stats */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Medicine-Specific Adherence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.medicineStats.length === 0 ? (
            <p className={`col-span-full text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No medicine data available for the selected period
            </p>
          ) : (
            stats.medicineStats.map(med => (
              <div key={med.id} className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {med.name}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Adherence:
                    </span>
                    <span className={`font-semibold ${
                      med.adherence >= 80 ? 'text-green-600' : 
                      med.adherence >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {med.adherence}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Taken:
                    </span>
                    <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {med.taken}/{med.total}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${
                        med.adherence >= 80 ? 'bg-green-500' : 
                        med.adherence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${med.adherence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insights */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Health Insights
        </h3>
        <div className="space-y-3">
          {stats.adherenceRate >= 90 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-green-800">
                Excellent adherence! You're taking {stats.adherenceRate}% of your medicines on time.
              </p>
            </div>
          )}
          {stats.adherenceRate >= 70 && stats.adherenceRate < 90 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-800">
                Good adherence at {stats.adherenceRate}%. Try to improve consistency for better health outcomes.
              </p>
            </div>
          )}
          {stats.adherenceRate < 70 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-red-800">
                Adherence needs improvement ({stats.adherenceRate}%). Consider setting more reminders or consulting your doctor.
              </p>
            </div>
          )}
          {stats.missed > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="text-blue-800">
                You've missed {stats.missed} doses recently. Consider enabling notifications or asking a caregiver for help.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryReports;