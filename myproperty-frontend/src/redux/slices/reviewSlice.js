import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const addReview = createAsyncThunk(
  "review/add",
  async ({ propertyId, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/properties/${propertyId}/reviews`, {
        rating,
        comment,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
export const updateReview = createAsyncThunk(
  "review/update",
  async ({ reviewId, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/reviews/${reviewId}`, { rating, comment });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteReview = createAsyncThunk(
  "review/delete",
  async (reviewId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reviewSlice.reducer;
