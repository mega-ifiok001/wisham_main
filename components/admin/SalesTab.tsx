'use client';

import type { Sale } from '@/lib/types';

interface Props {
  sales: Sale[];
}

export function SalesTab({ sales }: Props) {
  const needsEmail = sales.some((s) => s.paymentStatus === 'success' && !s.emailSent);

  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-lg">{sales.length} sales</h3>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {sales.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-400">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3">Beat</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">License</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-3 font-bold">
                      {s.beatTitle}
                      {s.licenseHash && (
                        <div className="text-[10px] font-mono text-red-500">{s.licenseHash}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div>{s.buyerEmail}</div>
                      {s.buyerName && <div className="text-xs text-neutral-400">{s.buyerName}</div>}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                          s.licenseType === 'exclusive'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {s.licenseType}
                        {s.includesStems ? ' +stems' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-black">${s.amountUsd.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                          s.paymentStatus === 'success'
                            ? 'bg-green-100 text-green-700'
                            : s.paymentStatus === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-400 text-xs">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {needsEmail && (
        <p className="text-xs text-amber-600">
          ️ Some successful sales have not received their email yet (check the RESEND_API_KEY + verified
          sender domain).
        </p>
      )}
    </div>
  );
}

export default SalesTab;