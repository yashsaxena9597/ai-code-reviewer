import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchSettings, updateSettings } from '../store/settingsSlice';
import { fetchReviews } from '../store/repoSlice';
import SettingsForm from '../components/SettingsForm';
import ReviewHistory from '../components/ReviewHistory';

const RepoSettings: React.FC = () => {
  const { repo } = useParams<{ repo: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { current: settings, loading, saving } = useSelector(
    (state: RootState) => state.settings,
  );
  const { reviews } = useSelector((state: RootState) => state.repos);

  const decodedRepo = repo ? decodeURIComponent(repo) : '';

  useEffect(() => {
    if (decodedRepo) {
      dispatch(fetchSettings(decodedRepo));
      dispatch(fetchReviews(decodedRepo));
    }
  }, [dispatch, decodedRepo]);

  const handleSave = (newSettings: any): void => {
    if (decodedRepo) {
      dispatch(updateSettings({ repo: decodedRepo, settings: newSettings }));
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading settings...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{decodedRepo}</h1>
        <p className="text-gray-400">Repository settings and review history</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Review Settings</h2>
        {settings ? (
          <SettingsForm settings={settings} onSave={handleSave} saving={saving} />
        ) : (
          <p className="text-gray-400">No settings found. Default configuration will be used.</p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Review History</h2>
        <ReviewHistory reviews={reviews} repoName={decodedRepo} />
      </div>
    </div>
  );
};

export default RepoSettings;
