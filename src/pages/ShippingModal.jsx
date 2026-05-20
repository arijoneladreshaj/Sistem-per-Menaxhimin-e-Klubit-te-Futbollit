import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API = 'http://localhost:5000/api/shipping';

const COUNTRIES = [
  'Albania', 'Austria', 'Belgium', 'Bosnia and Herzegovina',
  'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark',
  'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Kosovo',
  'Netherlands', 'North Macedonia', 'Norway', 'Poland',
  'Portugal', 'Romania', 'Serbia', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'United Kingdom', 'United States',
];

const CURRENCIES = [
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'Pound Sterling (£)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'DKK', label: 'Danish Krone (DKK)' },
  { code: 'NOK', label: 'Norwegian Krone (NOK)' },
  { code: 'SEK', label: 'Swedish Krone (SEK)' },
  { code: 'PLN', label: 'Polish Zloty (PLN)' },
];

const LANGUAGES = [
  { code: 'sq', label: 'Shqip' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
];

const MU_RED = '#DA291C';

export default function ShippingModal({ onClose }) {
  const [country, setCountry]   = useState('Kosovo');
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('sq');
  const [saved, setSaved]       = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) return;
    axios.get(`${API}/${user.id}`)
      .then(res => {
        if (res.data.country)  setCountry(res.data.country);
        if (res.data.currency) setCurrency(res.data.currency);
        if (res.data.language) setLanguage(res.data.language);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      if (user.id) {
        await axios.put(`${API}/${user.id}`, { country, currency, language });
      }
    } catch (err) {
      console.error('Preferences error:', err);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); if (onClose) onClose(); }, 1200);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.65)', zIndex: 2000 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden"
        style={{ width: '100%', maxWidth: 420, margin: '0 16px' }}
      >

        {/* HEADER */}
        <div className="px-4 pt-4 pb-3 border-bottom text-center position-relative">

          <button
            className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center p-0"
            style={{ width: 34, height: 34 }}
            onClick={onClose}
          >
            <i className="bi bi-x-lg" style={{ fontSize: 13 }}></i>
          </button>

          {/* Logo */}
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <span className="fw-bold fs-5" style={{ fontFamily: 'Oswald,sans-serif', letterSpacing: 1, color: '#000000' }}>
              UNITED
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
              style={{ width: 44, height: 44, background: MU_RED }}
            >
              <img src="/ManUnited.png" alt="Manchester United" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </div>
            <span className="fw-bold fs-5" style={{ fontFamily: 'Oswald,sans-serif', letterSpacing: 1, color: '#000000' }}>
              STORE
            </span>
          </div>

          <h5 className="fw-bold mb-1" style={{ fontFamily: 'Oswald,sans-serif', fontSize: 22, color: '#000000' }}>
            Shteti i Dërgimit
          </h5>
          <p className="text-muted mb-0 small">
            Zgjidhni opsionet për të përditësuar
          </p>
        </div>

        {/* BODY */}
        <div className="px-4 py-4">

          {/* Country */}
          <div className="mb-3">
            <label className="form-label small text-muted">
              Ndryshoni shtetin e dërgimit
            </label>
            <select
              className="form-select form-select-lg"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div className="mb-3">
            <label className="form-label small text-muted">
              Ndryshoni monedhën
            </label>
            <select
              className="form-select form-select-lg"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="mb-4">
            <label className="form-label small text-muted">
              Zgjidhni gjuhën
            </label>
            <select
              className="form-select form-select-lg"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Save */}
          <button
            className="btn w-100 fw-bold text-white py-3"
            style={{
              background: saved ? '#22a05a' : MU_RED,
              borderRadius: 50,
              fontFamily: 'Oswald,sans-serif',
              fontSize: 16,
              letterSpacing: 2,
              border: 'none',
              transition: 'background 0.2s',
            }}
            onClick={handleSave}
          >
            {saved
              ? <><i className="bi bi-check-lg me-2"></i>U RUAJT!</>
              : 'RUAJ'
            }
          </button>

        </div>
      </div>
    </div>
  );
}
