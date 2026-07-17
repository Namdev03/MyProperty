import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import userReducer from "./slices/userSlice.js";
import ownerReducer from "./slices/ownerSlice.js";
import propertyReducer from "./slices/propertySlice.js";
import bookingReducer from "./slices/bookingSlice.js";
import contactReducer from "./slices/contactSlice.js";
import notificationReducer from "./slices/notificationSlice.js";
import reviewReducer from "./slices/reviewSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    owner: ownerReducer,
    property: propertyReducer,
    booking: bookingReducer,
    contact: contactReducer,
    notification: notificationReducer,
    review: reviewReducer,
  },
});
