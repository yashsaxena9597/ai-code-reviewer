import React from 'react';
import RepoList from '../components/RepoList';
import ScoreChart from '../components/ScoreChart';

// Placeholder data for demonstration
const DEMO_REPOS = [
  { repo: 'yashsaxena/ecommerce-api', enabled: true, provider: 'claude' },
  { repo: 'yashsaxena/marketplace-sync', enabled: true, provider: 'openai' },
  { repo: 'yashsaxena/ai-code-reviewer', enabled: true, provider: 'claude' },
];

const DEMO_SCORES = [
  { date: '2025-06-01', score: 7.2 },
  { date: '2025-06-03', score: 8.1 },
  { date: '2025-06-05', score: 6.5 },
  { date: '2025-06-08', score: 8.8 },
  { date: '2025-06-10', score: 9.2 },
  { date: '2025-06-12', score: 7.9 },
  { date: '2025-06-15', score: 8.5 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your AI-powered code reviews</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">Total Reviews</p>
          <p className="text-3xl font-bold text-white mt-1">142</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">Average Score</p>
          <p className="text-3xl font-bold text-green-400 mt-1">8.1/10</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">Issues Caught</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">387</p>
        </div>
      </div>

      <ScoreChart scores={DEMO_SCORES} />

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Connected Repositories</h2>
        <RepoList repos={DEMO_REPOS} />
      </div>
    </div>
  );
};

export default Dashboard;
