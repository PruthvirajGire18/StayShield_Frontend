'use client';
import { useState, useEffect } from 'react';

export default function TimelineCalendar({ properties, policies, ownerBlocks }) {
  const [days, setDays] = useState([]);

  useEffect(() => {
    const generatedDays = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() + i);
      return d;
    });
    setDays(generatedDays);
  }, []);

  const getDayStatus = (propertyId, dayDate) => {
    const t = dayDate.getTime();

    const matchedPolicy = policies.find((p) => {
      const pid = p.propertyId?._id || p.propertyId;
      const start = new Date(p.checkInDate).getTime();
      const end = new Date(p.checkOutDate).getTime();
      return pid === propertyId && t >= start && t < end;
    });

    if (matchedPolicy) {
      return {
        type: matchedPolicy.status,
        label: `${matchedPolicy.policyNumber} ($${matchedPolicy.totalPremium})`,
      };
    }

    const matchedBlock = ownerBlocks.find((b) => {
      const pid = b.propertyId?._id || b.propertyId;
      const start = new Date(b.startDate).getTime();
      const end = new Date(b.endDate).getTime();
      return pid === propertyId && t >= start && t < end;
    });

    if (matchedBlock) {
      return { type: 'OWNER_BLOCK', label: 'Owner Block ($0)' };
    }

    return { type: 'VACANT', label: 'Vacant ($0)' };
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="font-bold tracking-tight text-slate-950">14-Day Property Protection Timeline</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">Live sync from connected Airbnb / Vrbo calendars</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block"></span> Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block"></span> Owner Block ($0)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
              <th className="py-3 px-4 font-semibold min-w-[180px]">Property</th>
              {days.map((d) => (
                <th key={d.toISOString()} className="py-2 px-2 text-center font-medium min-w-[54px]">
                  <div>{d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}</div>
                  <div className="text-slate-900 font-bold">{d.getUTCDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={days.length + 1 || 15} className="py-8 text-center text-slate-400">
                  No properties added yet. Click &quot;+ Add Property &amp; iCal&quot; to connect your calendar.
                </td>
              </tr>
            ) : (
              properties.map((prop) => (
                <tr key={prop._id} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div>{prop.title}</div>
                    <div className="text-xs text-slate-400">{prop.coverageTier} Tier</div>
                  </td>
                  {days.map((d) => {
                    const cell = getDayStatus(prop._id, d);
                    let cellColor = 'bg-slate-50';
                    if (cell.type === 'Active') cellColor = 'bg-emerald-500';
                    else if (cell.type === 'Scheduled') cellColor = 'bg-sky-400';
                    else if (cell.type === 'Payment_Failed') cellColor = 'bg-rose-500';
                    else if (cell.type === 'OWNER_BLOCK') cellColor = 'bg-slate-300';

                    return (
                      <td key={d.toISOString()} className="p-1.5 text-center" title={cell.label}>
                        <div className={`h-7 rounded-lg ${cellColor} transition-all duration-200`} />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
