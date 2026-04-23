import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/client';

interface SettingsState {
  current: any | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  current: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (repo: string) => {
    const data = await api.getSettings(repo);
    return data.settings;
  },
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async ({ repo, settings }: { repo: string; settings: any }) => {
    const data = await api.updateSettings(repo, settings);
    return data.settings;
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      .addCase(updateSettings.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateSettings.fulfilled, (state, action: PayloadAction<any>) => {
        state.saving = false;
        state.current = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save settings';
      });
  },
});

export default settingsSlice.reducer;
