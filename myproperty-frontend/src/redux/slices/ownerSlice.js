import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { setAuthenticated, clearAuthenticated } from "./authSlice.js";
import { setStoredRole, clearStoredRole } from "../../utils/authStorage.js";

// ---- Thunks ----

export const registerOwner = createAsyncThunk(
  "owner/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/owner/register", formData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginOwner = createAsyncThunk(
  "owner/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/owner/login", credentials);
      dispatch(setAuthenticated({ role: "owner" }));
      setStoredRole("owner");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logoutOwner = createAsyncThunk(
  "owner/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post("/owner/logout");
      dispatch(clearAuthenticated());
      clearStoredRole();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOwnerProfile = createAsyncThunk(
  "owner/fetchProfile",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/owner/profile");
      dispatch(setAuthenticated({ role: "owner" }));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateOwnerProfile = createAsyncThunk(
  "owner/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch("/owner/profile", formData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOwnerDashboardStats = createAsyncThunk(
  "owner/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/owner/dashboard/stats");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ---- Slice ----

const initialState = {
  profile: null,
  stats: {
    totalProperties: 0,
    activeListings: 0,
    totalBookings: 0,
    revenue: 0,
  },
  loading: false,
  error: null,
};

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    resetOwnerState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data.owner;
      })
      .addCase(loginOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerOwner.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchOwnerProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data.owner;
      })
      .addCase(fetchOwnerProfile.rejected, (state) => {
        state.profile = null;
      })
      .addCase(updateOwnerProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data.owner;
      })
      .addCase(fetchOwnerDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      .addCase(logoutOwner.fulfilled, () => initialState);
  },
});

export const { resetOwnerState } = ownerSlice.actions;
export default ownerSlice.reducer;
