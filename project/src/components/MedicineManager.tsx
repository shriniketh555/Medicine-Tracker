import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Pill, Clock, Calendar } from 'lucide-react';
import { Medicine } from '../App';

interface MedicineManagerProps {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  darkMode: boolean;
}

const MedicineManager: React.FC<MedicineManagerProps> = ({
  medicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  darkMode
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: [''],
    instructions: '',
    startDate: '',
    endDate: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: [''],
      instructions: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const medicineData = {
      ...formData,
      times: formData.times.filter(time => time.trim() !== ''),
      endDate: formData.endDate || undefined
    };

    if (editingId) {
      updateMedicine(editingId, medicineData);
      setEditingId(null);
    } else {
      addMedicine(medicineData);
      setShowAddForm(false);
    }
    resetForm();
  };

  const handleEdit = (medicine: Medicine) => {
    setFormData({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      times: medicine.times,
      instructions: medicine.instructions,
      startDate: medicine.startDate,
      endDate: medicine.endDate || ''
    });
    setEditingId(medicine.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '']
    }));
  };

  const updateTimeSlot = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((time, i) => i === index ? value : time)
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Medicine Management</h2>
          <p className={`text-xl mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your daily medications</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-3 bg-blue-500 text-white px-6 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
        >
          <Plus className="w-6 h-6" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Add/Edit Medicine Form */}
      {showAddForm && (
        <div className={`rounded-xl shadow-lg p-8 border-2 ${
          darkMode ? 'bg-gray-800 border-blue-700' : 'bg-white border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingId ? 'Edit Medicine' : 'Add New Medicine'}
            </h3>
            <button
              onClick={handleCancel}
              className={`transition-colors ${
                darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Aspirin, Metformin"
                />
              </div>

              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., 1 tablet, 5mg, 2 capsules"
                />
              </div>
            </div>

            <div>
              <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="daily">Daily</option>
                <option value="twice-daily">Twice Daily</option>
                <option value="three-times-daily">Three Times Daily</option>
                <option value="weekly">Weekly</option>
                <option value="as-needed">As Needed</option>
              </select>
            </div>

            <div>
              <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Times *
              </label>
              <div className="space-y-3">
                {formData.times.map((time, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => updateTimeSlot(index, e.target.value)}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className={`transition-colors ${
                          darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'
                        }`}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className={`flex items-center space-x-2 transition-colors text-lg font-medium ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Another Time</span>
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., Take with food, Before meals, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-600 transition-colors"
              >
                <Save className="w-6 h-6" />
                <span>{editingId ? 'Update Medicine' : 'Save Medicine'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medicine List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {medicines.length === 0 ? (
          <div className={`lg:col-span-2 rounded-xl shadow-lg p-12 text-center ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <Pill className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No medicines added yet</h3>
            <p className={`text-xl mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start by adding your first medicine to begin tracking</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Medicine</span>
            </button>
          </div>
        ) : (
          medicines.map(medicine => (
            <div key={medicine.id} className={`rounded-xl shadow-lg p-6 border hover:shadow-xl transition-shadow ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <Pill className={`w-7 h-7 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{medicine.name}</h3>
                    <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{medicine.dosage}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(medicine)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-blue-400 hover:bg-blue-900/30' 
                        : 'text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <Edit className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => deleteMedicine(medicine.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-red-400 hover:bg-red-900/30' 
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Times: {medicine.times.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {medicine.frequency.charAt(0).toUpperCase() + medicine.frequency.slice(1).replace('-', ' ')}
                  </span>
                </div>
                {medicine.instructions && (
                  <p className={`p-3 rounded-lg ${
                    darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'
                  }`}>
                    <strong>Instructions:</strong> {medicine.instructions}
                  </p>
                )}
                <div className={`flex justify-between text-sm pt-2 border-t ${
                  darkMode ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'
                }`}>
                  <span>Start: {new Date(medicine.startDate).toLocaleDateString()}</span>
                  {medicine.endDate && (
                    <span>End: {new Date(medicine.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicineManager;