import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { AppProvider } from './store.jsx';
import Layout from './components/Layout.jsx';
import PlanPage from './pages/PlanPage.jsx';
import CalculatorPage from './pages/CalculatorPage.jsx';
import AuditorPage from './pages/AuditorPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import HardPage from './pages/HardPage.jsx';
import EServicesPage from './pages/EServicesPage.jsx';
import KnowledgePage from './pages/KnowledgePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import WizardPage from './pages/WizardPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<PlanPage />} />
            <Route path="/kalkulator" element={<CalculatorPage />} />
            <Route path="/audytor" element={<AuditorPage />} />
            <Route path="/dokumenty" element={<DocumentsPage />} />
            <Route path="/trudne-sytuacje" element={<HardPage />} />
            <Route path="/e-uslugi" element={<EServicesPage />} />
            <Route path="/baza-wiedzy" element={<KnowledgePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/kreator" element={<WizardPage />} />
            <Route path="*" element={<PlanPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
);
