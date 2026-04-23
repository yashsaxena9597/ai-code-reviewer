const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getRepos: (installationId: number) =>
    request<{ repos: any[] }>(`/repos?installation_id=${installationId}`),

  getReviews: (repo: string, limit = 20) =>
    request<{ reviews: any[]; averageScore: number }>(
      `/repos/${encodeURIComponent(repo)}/reviews?limit=${limit}`,
    ),

  getSettings: (repo: string) =>
    request<{ settings: any }>(`/repos/${encodeURIComponent(repo)}/settings`),

  updateSettings: (repo: string, settings: any) =>
    request<{ settings: any }>(`/repos/${encodeURIComponent(repo)}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
