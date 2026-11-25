'use client';
import { useState } from 'react';
import { X, Calendar, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function AddPropertyModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  const [propForm, setPropForm] = useState({
    title: '',
    propertyType: 'Villa',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    hasPoolOrJacuzzi: false,
    estimatedContentsValue: 10000,
    coverageTier: 'Standard',
    address: {
      streetAddress: '',
      city: 'Lonavala',
      state: 'Maharashtra',
      postalCode: '410401',
      country: 'IN',
    },
  });

  const [feedForm, setFeedForm] = useState({
    platform: 'Airbnb',
    icalUrl: '',
  });

  if (!isOpen) return null;

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/properties', propForm);
      setCreatedPropertyId(res.data.data._id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/properties/${createdPropertyId}/feeds`, feedForm);
      setSyncResult(res.data.data.syncSummary);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync .ics calendar');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSyncResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:max-h-[calc(100dvh-2rem)] sm:p-7">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold tracking-tight text-slate-950">
            {step === 1 && 'Step 1: Add Rental Property'}
            {step === 2 && 'Step 2: Connect Booking Calendar (.ics)'}
            {step === 3 && 'Calendar Synced!'}
          </h3>
          <button onClick={resetAndClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleCreateProperty} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Property Title</label>
              <input
                type="text"
                required
                placeholder="Sunset Cliff Villa - Lonavala"
                value={propForm.title}
                onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Property Type</label>
                <select
                  value={propForm.propertyType}
                  onChange={(e) => setPropForm({ ...propForm, propertyType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                  <option value="Cabin">Cabin</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Coverage Tier</label>
                <select
                  value={propForm.coverageTier}
                  onChange={(e) => setPropForm({ ...propForm, coverageTier: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="Essential">Essential ($5/night · $2.5k cap)</option>
                  <option value="Standard">Standard ($9/night · $10k cap)</option>
                  <option value="Premier">Premier ($14/night · $25k cap)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  required
                  value={propForm.address.city}
                  onChange={(e) =>
                    setPropForm({ ...propForm, address: { ...propForm.address, city: e.target.value } })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Contents Value ($)</label>
                <input
                  type="number"
                  min={500}
                  required
                  value={propForm.estimatedContentsValue}
                  onChange={(e) =>
                    setPropForm({ ...propForm, estimatedContentsValue: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Street Address</label>
              <input
                type="text"
                required
                placeholder="Plot 42, Tungarli Hills"
                value={propForm.address.streetAddress}
                onChange={(e) =>
                  setPropForm({
                    ...propForm,
                    address: { ...propForm.address, streetAddress: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving Property...' : 'Continue to Calendar Sync'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConnectCalendar} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Booking Platform</label>
              <select
                value={feedForm.platform}
                onChange={(e) => setFeedForm({ ...feedForm, platform: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="Airbnb">Airbnb</option>
                <option value="Vrbo">Vrbo</option>
                <option value="Booking">Booking.com</option>
                <option value="Direct">Direct / Google Calendar</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Export Calendar (.ics) URL
              </label>
              <input
                type="url"
                required
                placeholder="https://www.airbnb.com/calendar/ical/123456.ics?s=..."
                value={feedForm.icalUrl}
                onChange={(e) => setFeedForm({ ...feedForm, icalUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Owner-blocked dates (&quot;Not available&quot;) are automatically ignored at $0 cost.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Fetching & Parsing Calendar...' : 'Connect & Sync Bookings'}
            </button>
          </form>
        )}

        {step === 3 && syncResult && (
          <div className="mt-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Sync Complete</h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm space-y-1">
              <p className="text-slate-700">
                Guest Bookings Scheduled:{' '}
                <span className="font-bold text-emerald-600">{syncResult.policiesScheduled}</span>
              </p>
              <p className="text-slate-500">
                Owner Blocked Events Ignored: <span className="font-semibold">{syncResult.ownerBlocksIgnored}</span>
              </p>
            </div>
            <button
              onClick={resetAndClose}
              className="min-h-11 w-full rounded-xl bg-slate-900 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-slate-800"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
