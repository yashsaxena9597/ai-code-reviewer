import React, { useState } from 'react';

interface Settings {
  provider: 'claude' | 'openai';
  model: string;
  categories: string[];
  maxFiles: number;
  maxLines: number;
  minScoreToPass: number;
  autoSuggestFixes: boolean;
  ignoredFiles: string[];
  ignoredDirectories: string[];
  enabled: boolean;
}

interface SettingsFormProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  saving: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave, saving }) => {
  const [form, setForm] = useState<Settings>(settings);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSave(form);
  };

  const toggleCategory = (cat: string): void => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">AI Provider</label>
          <select
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value as 'claude' | 'openai' })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          >
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">GPT (OpenAI)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
          <input
            type="text"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Min Score to Pass</label>
          <input
            type="number"
            min={1}
            max={10}
            value={form.minScoreToPass}
            onChange={(e) => setForm({ ...form, minScoreToPass: parseInt(e.target.value, 10) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Files per Review</label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.maxFiles}
            onChange={(e) => setForm({ ...form, maxFiles: parseInt(e.target.value, 10) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Review Categories</label>
        <div className="flex space-x-4">
          {['code-quality', 'security', 'performance'].map((cat) => (
            <label key={cat} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="rounded bg-gray-700 border-gray-600"
              />
              <span className="text-gray-300 text-sm capitalize">{cat.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.autoSuggestFixes}
            onChange={(e) => setForm({ ...form, autoSuggestFixes: e.target.checked })}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-gray-300 text-sm">Auto-suggest fixes</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-gray-300 text-sm">Enabled</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-md transition-colors"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
};

export default SettingsForm;
