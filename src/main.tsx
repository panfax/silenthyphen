import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { Admin } from './pages/Admin';
import { CustomRules } from './pages/CustomRules';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/custom-rules" element={<CustomRules />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
