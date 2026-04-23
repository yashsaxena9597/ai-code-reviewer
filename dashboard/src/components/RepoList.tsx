import React from 'react';
import { Link } from 'react-router-dom';

interface Repo {
  repo: string;
  enabled: boolean;
  provider: string;
}

interface RepoListProps {
  repos: Repo[];
}

const RepoList: React.FC<RepoListProps> = ({ repos }) => {
  if (repos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No repositories connected yet.</p>
        <p className="mt-2">Install the GitHub App on a repository to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <div
          key={repo.repo}
          className="bg-gray-800 rounded-lg border border-gray-700 p-5 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold truncate">{repo.repo}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                repo.enabled
                  ? 'bg-green-900 text-green-300'
                  : 'bg-red-900 text-red-300'
              }`}
            >
              {repo.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">Provider: {repo.provider}</p>
          <Link
            to={`/repos/${encodeURIComponent(repo.repo)}/settings`}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Settings
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RepoList;
