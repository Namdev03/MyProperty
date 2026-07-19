import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { setAuthenticated, clearAuthenticated } from "./authSlice.js";
import { setStoredRole, clearStoredRole } from "../../utils/authStorage.js";
// ---- Thunks ----
export const registerUser = createAsyncThunk(
  "user/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/register", formData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/login", payload);
      dispatch(setAuthenticated({ role: "user" }));
      setStoredRole("user");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
export const verifyMobile = createAsyncThunk('/user/verify/:mobile', async ({ mobile, otp }, { rejectWithValue ,dispatch}) => {
  try {
    const { data } = await axiosInstance.post(`/user/verify/${mobile}`, { otp })
    dispatch(setAuthenticated({ role: "user" }));
    setStoredRole("user");
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post("/user/logout");
      dispatch(clearAuthenticated());
      clearStoredRole();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user/profile");
      dispatch(setAuthenticated({ role: "user" }));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch("/user/profile", formData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  "user/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user/wishlist");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  "user/toggleWishlist",
  async ({ propertyId, isWishlisted }, { rejectWithValue }) => {
    try {
      if (isWishlisted) {
        await axiosInstance.delete(`/user/wishlist/${propertyId}`);
      } else {
        await axiosInstance.post(`/user/wishlist/${propertyId}`);
      }
      return { propertyId, isWishlisted: !isWishlisted };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ---- Slice ----

const initialState = {
  profile: null,
  wishlist: [],
  loading: false,
  error: null,
  verify: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile fetch
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data.user;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.profile = null;
      })
      // Profile update
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data.user;
      })
      // Logout
      .addCase(logoutUser.fulfilled, () => initialState)
      // Wishlist
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload.data.wishlist;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { propertyId, isWishlisted } = action.payload;
        if (isWishlisted) {
          // added — the full property object isn't available here, so the
          // component should re-fetch or optimistically add what it has
        } else {
          state.wishlist = state.wishlist.filter((p) => p._id !== propertyId);
        }
      }).addCase(verifyMobile.pending, (state) => {
        state.loading = true;
      }).addCase(verifyMobile.fulfilled, (state, action) => {
        state.loading = false;
        state.verify = action.payload;
      }).addCase(verifyMobile.rejected, (state,action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
