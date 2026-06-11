import React from 'react';
import { getMonthlyReadingData } from '../utils/statsUtils';

export default function MonthlyReadingChart({ loggedBooks }) {
  const data = getMonthlyReadingData(loggedBooks);
  const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 1;

  return (
    <div className="stats-chart-card monthly-reading-card">
      <h4>MONTHLY READING</h4>
      {loggedBooks.length > 0 ? (
        <div className="monthly-chart-container">
          <div className="monthly-chart-bars">
            {data.map(({ monthLabel, yearLabel, count, dateKey }) => {
              const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={dateKey} className="monthly-bar-col" title={`${monthLabel} ${yearLabel}: ${count} book(s)`}>
                  <div className="monthly-bar-track">
                    <div 
                      className="monthly-bar-fill" 
                      style={{ height: `${heightPercent}%` }}
                    >
                      {count > 0 && <span className="bar-tooltip">{count}</span>}
                    </div>
                  </div>
                  <span className="monthly-bar-label">{monthLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="chart-empty-state">No books logged yet.</div>
      )}
    </div>
  );
}
