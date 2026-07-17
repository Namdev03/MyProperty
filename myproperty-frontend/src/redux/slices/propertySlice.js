import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

// ---- Thunks ----

/**
 * filters is a plain object of query params, e.g.
 * { q, city, propertyType, minPrice, maxPrice, page, limit }
 * Axios's `params` option serializes it into the querystring.
 */
export const fetchProperties = createAsyncThunk(
  "property/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/properties", { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  "property/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/properties/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOwnerProperties = createAsyncThunk(
  "property/fetchOwnerProperties",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/owner/properties");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * formData must be a FormData instance (multipart) since the backend
 * expects file fields (propertyImages, roomImages, kitchenImages,
 * bathroomImages, hallImages) alongside the text fields.
 */
export const createProperty = createAsyncThunk(
  "property/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/properties", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const editProperty = createAsyncThunk(
  "property/edit",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/properties/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProperty = createAsyncThunk(
  "property/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/properties/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ---- Slice ----

const initialState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
  current: null,
  ownerProperties: [],
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    clearCurrentProperty: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.properties;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.data.property;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOwnerProperties.fulfilled, (state, action) => {
        state.ownerProperties = action.payload.data.properties;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.ownerProperties.unshift(action.payload.data.property);
      })
      .addCase(editProperty.fulfilled, (state, action) => {
        const updated = action.payload.data.property;
        state.ownerProperties = state.ownerProperties.map((p) =>
          p._id === updated._id ? updated : p
        );
        if (state.current?._id === updated._id) state.current = updated;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.ownerProperties = state.ownerProperties.filter(
          (p) => p._id !== action.payload
        );
      });
  },
});

export const { clearCurrentProperty } = propertySlice.actions;
export default propertySlice.reducer;
