import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/client';

interface RepoState {
  repos: any[];
  reviews: any[];
  averageScore: number;
  loading: boolean;
  error: string | null;
}

const initialState: RepoState = {
  repos: [],
  reviews: [],
  averageScore: 0,
  loading: false,
  error: null,
};

export const fetchRepos = createAsyncThunk(
  'repos/fetchRepos',
  async (installationId: number) => {
    const data = await api.getRepos(installationId);
    return data.repos;
  },
);

export const fetchReviews = createAsyncThunk(
  'repos/fetchReviews',
  async (repo: string) => {
    return api.getReviews(repo);
  },
);

const repoSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepos.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.repos = action.payload;
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch repos';
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.reviews = action.payload.reviews;
        state.averageScore = action.payload.averageScore;
      });
  },
});

export default repoSlice.reducer;
