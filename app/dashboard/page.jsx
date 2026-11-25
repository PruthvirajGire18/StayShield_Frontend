'use client';
import { useEffect, useState } from 'react';
import { Plus, Shield, CalendarCheck, DollarSign, Home } from 'lucide-react';
import api from '@/lib/api';
import AddPropertyModal from '@/components/AddPropertyModal';
import TimelineCalendar from '@/components/TimelineCalendar';

export default function DashboardOverviewPage() {
  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState({
    activeCount: 0,
    scheduledCount: 0,
    totalInsuredNights: 0,
    totalPremium: 0,
  });
  const [timeline, setTimeline] = useState({ policies: [], ownerBlocks: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [propRes, polRes, timeRes] = await Promise.all([
        api.get('/properties'),
        api.get('/policies'),
        api.get('/policies/timeline'),
      ]);
      setProperties(propRes.data.data);
      setSummary(polRes.data.data.summary);
      setTimeline(timeRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const kpis = [
    {
      label: 'Monitored Properties',
      value: properties.length,
      icon: Home,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Scheduled / Active Stays',
      value: summary.activeCount + summary.scheduledCount,
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Total Insured Nights',
      value: summary.totalInsuredNights,
      icon: CalendarCheck,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'Projected / Total Spend',
      value: `$${summary.totalPremium}`,
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-9">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Protection Overview</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Automated per-night coverage synced directly with your booking calendars.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Property & iCal
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Occupancy & Policy Timeline */}
      <TimelineCalendar
        properties={properties}
        policies={timeline.policies}
        ownerBlocks={timeline.ownerBlocks}
      />

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
