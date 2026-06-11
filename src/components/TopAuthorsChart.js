import React from 'react';
import { getTopAuthors } from '../utils/statsUtils';

export default function TopAuthorsChart({ loggedBooks }) {
  const topAuthors = getTopAuthors(loggedBooks, 5);
  const maxCount = topAuthors.length > 0 ? Math.max(...topAuthors.map(a => a.count)) : 1;

  return (
    <div className="stats-chart-card top-authors-card">
      <h4>TOP AUTHORS</h4>
      {topAuthors.length > 0 ? (
        <div className="top-authors-list">
          {topAuthors.map(({ author, count }) => {
            const widthPercent = (count / maxCount) * 100;
            return (
              <div key={author} className="author-bar-row">
                <div className="author-name-label" title={author}>
                  {author}
                </div>
                <div className="author-bar-track">
                  <div 
                    className="author-bar-fill" 
                    style={{ width: `${widthPercent}%` }}
                    title={`${count} book(s)`}
                  />
                </div>
                <div className="author-count-badge">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="chart-empty-state">No books logged yet.</div>
      )}
    </div>
  );
}
