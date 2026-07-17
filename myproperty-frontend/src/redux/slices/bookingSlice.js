import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const createBooking = createAsyncThunk(
  "booking/create",
  async (bookingData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/bookings", bookingData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancel",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  "booking/fetchUserBookings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user/bookings");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOwnerBookings = createAsyncThunk(
  "booking/fetchOwnerBookings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/owner/bookings");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  userBookings: [],
  ownerBookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings.unshift(action.payload.data.booking);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.userBookings = action.payload.data.bookings;
      })
      .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
        state.ownerBookings = action.payload.data.bookings;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const updated = action.payload.data.booking;
        const patch = (list) =>
          list.map((b) => (b._id === updated._id ? updated : b));
        state.userBookings = patch(state.userBookings);
        state.ownerBookings = patch(state.ownerBookings);
      });
  },
});

export default bookingSlice.reducer;
