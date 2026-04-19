import { addCalendarDays } from '@/lib/dateDisplay';
import { formatRMUnsigned } from '@/lib/currency';
import { formatPlPct, formatPlRm, plRmStyle } from '@/lib/plFormat';
import {
  resolveDisplayCurrent,
  valueOnDate,
  type PricePoint,
} from '@/lib/priceHistoryMath';
import type { Investment } from '@/types';

interface Props {
  investments: Investment[];
  byAsset: Map<string, PricePoint[]>;
  todayStr: string;
}

export function DailyCashflowTable({ investments, byAsset, todayStr }: Props) {
  const yStr = addCalendarDays(todayStr, -1);

  const rows = investments.map((inv) => {
    const series = byAsset.get(inv.name) ?? [];
    const todayVal = resolveDisplayCurrent(inv.current, series);
    const yVal = valueOnDate(series, yStr);
    const hasY = yVal !== undefined;
    const changeRm = hasY ? todayVal - yVal : null;
    const changePct =
      hasY && yVal !== 0 && changeRm !== null ? (changeRm / yVal) * 100 : null;

    return {
      inv,
      todayVal,
      yVal,
      hasY,
      changeRm,
      changePct,
    };
  });

  let gain = 0;
  let loss = 0;
  for (const r of rows) {
    if (r.changeRm == null) continue;
    if (r.changeRm > 0) gain += r.changeRm;
    else if (r.changeRm < 0) loss += r.changeRm;
  }
  const net = gain + loss;

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-950">
              <th className="px-4 py-2 font-semibold">Asset</th>
              <th className="px-4 py-2 font-semibold">Risk</th>
              <th className="px-4 py-2 font-semibold text-right">Yesterday (RM)</th>
              <th className="px-4 py-2 font-semibold text-right">Today (RM)</th>
              <th className="px-4 py-2 font-semibold text-right">Change (RM)</th>
              <th className="px-4 py-2 font-semibold text-right">Change (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ inv, todayVal, yVal, hasY, changeRm, changePct }) => (
              <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                  {inv.name}
                </td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{inv.risk}</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-600 dark:text-slate-300">
                  {hasY && yVal !== undefined ? formatRMUnsigned(yVal) : '—'}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">
                  {formatRMUnsigned(todayVal)}
                </td>
                <td
                  className="px-4 py-2 text-right font-medium tabular-nums"
                  style={changeRm != null ? plRmStyle(changeRm) : undefined}
                >
                  {changeRm == null ? (
                    <span className="text-slate-400 font-normal">—</span>
                  ) : (
                    formatPlRm(changeRm)
                  )}
                </td>
                <td
                  className="px-4 py-2 text-right font-medium tabular-nums"
                  style={
                    changePct == null
                      ? undefined
                      : {
                          color:
                            changePct > 0 ? '#3B6D11' : changePct < 0 ? '#A32D2D' : undefined,
                        }
                  }
                >
                  {changePct == null ? (
                    <span className="text-slate-400 font-normal">—</span>
                  ) : (
                    formatPlPct(changePct)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <td colSpan={4} className="px-4 py-2 font-semibold">
                Total gain today (RM)
              </td>
              <td colSpan={2} className="px-4 py-2 text-right font-semibold text-[#3B6D11]">
                {formatPlRm(gain)}
              </td>
            </tr>
            <tr className="bg-slate-50 dark:bg-slate-950">
              <td colSpan={4} className="px-4 py-2 font-semibold">
                Total loss today (RM)
              </td>
              <td colSpan={2} className="px-4 py-2 text-right font-semibold text-[#A32D2D]">
                {formatPlRm(loss)}
              </td>
            </tr>
            <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <td colSpan={4} className="px-4 py-2 font-semibold">
                Net P&amp;L today (RM)
              </td>
              <td
                colSpan={2}
                className="px-4 py-2 text-right font-bold"
                style={plRmStyle(net)}
              >
                {formatPlRm(net)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
