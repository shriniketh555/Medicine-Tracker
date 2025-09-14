import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Bell, CheckCircle, XCircle, Clock, AlertCircle, Moon, Sun } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MedicineManager from './components/MedicineManager';
import DailyTracker from './components/DailyTracker';
import ProfileManager from './components/ProfileManager';
import HistoryReports from './components/HistoryReports';
import CaregiverNotifications from './components/CaregiverNotifications';
import { db } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions: string;
  startDate: string;
  endDate?: string;
}

export interface MedicineIntake {
  id: string;
  medicineId: string;
  date: string;
  time: string;
  status: 'taken' | 'skipped' | 'missed';
  timestamp: string;
}

export interface UserProfile {
  name: string;
  age: number;
  healthCondition: string;
  emergencyContact: string;
  caregiverEmail: string;
  doctorName: string;
  doctorPhone: string;
}

function App({  } : { apiUrl?: string; analyticsId?: string }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'medicines' | 'tracker' | 'profile' | 'history' | 'caregiver'>('dashboard');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [intakes, setIntakes] = useState<MedicineIntake[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 0,
    healthCondition: '',
    emergencyContact: '',
    caregiverEmail: '',
    doctorName: '',
    doctorPhone: ''
  });
  const [notifications, setNotifications] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Load data from Firestore
    const fetchData = async () => {
      try {
        const medicinesSnap = await getDocs(collection(db, 'medicines'));
        const medicinesData = medicinesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMedicines(medicinesData as Medicine[]);

        const intakesSnap = await getDocs(collection(db, 'intakes'));
        const intakesData = intakesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIntakes(intakesData as MedicineIntake[]);

        const profileSnap = await getDocs(collection(db, 'profiles'));
        const profileData = profileSnap.docs.length > 0 ? profileSnap.docs[0].data() : null;
        if (profileData) setProfile(profileData as UserProfile);
      } catch (error) {
        console.error('Error loading data from Firestore:', error);
      }
    };
    fetchData();

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotifications(permission === 'granted');
      });
    }

    // Example: Use API URL and Analytics ID
    // if (apiUrl) {
    //   console.log('Using API URL:', apiUrl);
    // }
    // if (analyticsId) {
    //   console.log('Using Analytics ID:', analyticsId);
    // }
  }, []);

  useEffect(() => {
    // Save medicines to Firestore
    const saveMedicines = async () => {
      for (const medicine of medicines) {
        await setDoc(doc(db, 'medicines', medicine.id), medicine);
      }
    };
    if (medicines.length > 0) {
      saveMedicines();
    }
  }, [medicines]);

  useEffect(() => {
    // Save intakes to Firestore
    const saveIntakes = async () => {
      for (const intake of intakes) {
        await setDoc(doc(db, 'intakes', intake.id), intake);
      }
    };
    if (intakes.length > 0) {
      saveIntakes();
    }
  }, [intakes]);

  useEffect(() => {
    // Save profile to Firestore
    const saveProfile = async () => {
      if (profile.name) {
        await setDoc(doc(db, 'profiles', 'main'), profile);
      }
    };
    saveProfile();
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Set up notification system
    const checkMedicineReminders = () => {
      if (!notifications) return;
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];
      
      medicines.forEach(medicine => {
        medicine.times.forEach(time => {
          if (time === currentTime) {
            // Check if medicine was already taken today at this time
            const existingIntake = intakes.find(intake => 
              intake.medicineId === medicine.id && 
              intake.date === today && 
              intake.time === time &&
              intake.status === 'taken'
            );
            
            if (!existingIntake) {
              new Notification(`Medicine Reminder`, {
                body: `⏰ Time to take ${medicine.name} - ${medicine.dosage}\n${medicine.instructions || 'Take as prescribed'}`,
                icon: '/pill-icon.png',
                requireInteraction: true,
                tag: `medicine-${medicine.id}-${time}`
              });
              
              // Send caregiver notification if medicine is missed after 30 minutes
              setTimeout(() => {
                const laterIntake = intakes.find(intake => 
                  intake.medicineId === medicine.id && 
                  intake.date === today && 
                  intake.time === time
                );
                if (!laterIntake && profile.caregiverEmail) {
                  sendCaregiverNotification(medicine, time);
                }
              }, 30 * 60 * 1000); // 30 minutes
            }
          }
        });
      });
    };

    const interval = setInterval(checkMedicineReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [medicines, intakes, notifications]);

  const sendCaregiverNotification = (medicine: Medicine, time: string) => {
    // In a real app, this would send an email/SMS to the caregiver
    console.log(`Caregiver notification: ${profile.name} missed ${medicine.name} at ${time}`);
    // For demo purposes, show a browser notification
    if (notifications) {
      new Notification(`Caregiver Alert`, {
        body: `${profile.name} may have missed ${medicine.name} scheduled for ${time}`,
        requireInteraction: true
      });
    }
  };

  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString()
    };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(med => med.id === id ? { ...med, ...updates } : med));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
    setIntakes(prev => prev.filter(intake => intake.medicineId !== id));
  };

  const addIntake = (intake: Omit<MedicineIntake, 'id' | 'timestamp'>) => {
    const newIntake: MedicineIntake = {
      ...intake,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setIntakes(prev => [...prev, newIntake]);
  };

  const updateIntakeStatus = (medicineId: string, date: string, time: string, status: 'taken' | 'skipped') => {
    const existingIntakeIndex = intakes.findIndex(intake => 
      intake.medicineId === medicineId && 
      intake.date === date && 
      intake.time === time
    );

    if (existingIntakeIndex >= 0) {
      setIntakes(prev => prev.map((intake, index) => 
        index === existingIntakeIndex ? { ...intake, status, timestamp: new Date().toISOString() } : intake
      ));
    } else {
      addIntake({
        medicineId,
        date,
        time,
        status
      });
    }
  };

  const exportData = (format: 'pdf' | 'csv') => {
    // In a real app, this would generate actual PDF/CSV files
    const data = {
      profile,
      medicines,
      intakes: intakes.slice(-30) // Last 30 days
    };
    
    if (format === 'csv') {
      const csvContent = generateCSV(data);
      downloadFile(csvContent, 'medicine-report.csv', 'text/csv');
    } else {
      // For PDF, you'd use a library like jsPDF
      alert('PDF export feature would be implemented with jsPDF library');
    }
  };

  const generateCSV = (data: any) => {
    const headers = ['Date', 'Medicine', 'Time', 'Status', 'Dosage'];
    const rows = data.intakes.map((intake: MedicineIntake) => {
      const medicine = data.medicines.find((m: Medicine) => m.id === intake.medicineId);
      return [
        intake.date,
        medicine?.name || 'Unknown',
        intake.time,
        intake.status,
        medicine?.dosage || ''
      ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-green-50'
    }`}>
      {/* Header */}
      <header className={`shadow-lg border-b-2 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-blue-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MedCare</h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Medicine Reminder & Tracker</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-full transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              {profile.name && (
                <div className="text-right">
                  <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Welcome, {profile.name}
                  </p>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stay healthy & on track</p>
                </div>
              )}
              </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`shadow-md transition-colors duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Calendar },
              { id: 'medicines', label: 'My Medicines', icon: Plus },
              { id: 'tracker', label: 'Daily Tracker', icon: CheckCircle },
              { id: 'history', label: 'History & Reports', icon: Clock },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'caregiver', label: 'Caregiver', icon: Bell }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            medicines={medicines}
            intakes={intakes}
            profile={profile}
            updateIntakeStatus={updateIntakeStatus}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'medicines' && (
          <MedicineManager
            medicines={medicines}
            addMedicine={addMedicine}
            updateMedicine={updateMedicine}
            deleteMedicine={deleteMedicine}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'tracker' && (
          <DailyTracker
            medicines={medicines}
            intakes={intakes}
            updateIntakeStatus={updateIntakeStatus}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'history' && (
          <HistoryReports
            medicines={medicines}
            intakes={intakes}
            profile={profile}
            exportData={exportData}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileManager
            profile={profile}
            setProfile={setProfile}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'caregiver' && (
          <>
            {console.log('Caregiver Email:', profile.caregiverEmail)}
            <CaregiverNotifications
              profile={profile}
              medicines={medicines}
              intakes={intakes}
              darkMode={darkMode}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;