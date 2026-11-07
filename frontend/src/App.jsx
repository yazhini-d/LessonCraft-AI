import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import CreateLesson from './pages/CreateLesson';
import Dashboard from './pages/Dashboard';
import LessonPreview from './pages/LessonPreview';
import QCReports from './pages/QCReports';
import api from './services/api';

export default function App() {
  const [activeLesson, setActiveLesson] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Try loading most recent lesson on mount if none active
  useEffect(() => {
    api.getLessons()
      .then(lessons => {
        if (lessons && lessons.length > 0 && !activeLesson) {
          setActiveLesson(lessons[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <Navbar 
        activeLesson={activeLesson}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <CreateLesson 
                onLessonCreated={(lesson) => {
                  setActiveLesson(lesson);
                  showToast('Lesson generated and audited through Dual QC layers!');
                }} 
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                onSelectLesson={(lesson) => setActiveLesson(lesson)}
                onNotify={showToast}
              />
            } 
          />
          <Route 
            path="/preview/:id" 
            element={
              <LessonPreview 
                activeLesson={activeLesson}
                onLessonUpdated={(lesson) => {
                  setActiveLesson(lesson);
                  showToast('Curriculum updated successfully.');
                }}
                onNotify={showToast}
              />
            } 
          />
          <Route 
            path="/qc/:id" 
            element={
              <QCReports 
                activeLesson={activeLesson}
                onLessonUpdated={(lesson) => {
                  setActiveLesson(lesson);
                }}
                onNotify={showToast}
              />
            } 
          />
        </Routes>
      </main>

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {toastMessage && (
        <div className="toast">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
