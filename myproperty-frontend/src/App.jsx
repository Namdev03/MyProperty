import { Routes, Route } from "react-router";
import { useAuthCheck } from "./hooks/useAuthCheck.js";

import { MainLayout } from "./layouts/MainLayout.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { RoleProtectedRoute } from "./routes/RoleProtectedRoute.jsx";

import { Home } from "./pages/Home.jsx";
import { PropertiesListing } from "./pages/PropertiesListing.jsx";
import { PropertyDetails } from "./pages/PropertyDetails.jsx";
import { Contact } from "./pages/Contact.jsx";
import { Notifications } from "./pages/Notifications.jsx";
import { NotFound } from "./pages/NotFound.jsx";

import { Login } from "./pages/auth/Login.jsx";
import { Signup } from "./pages/auth/Signup.jsx";
import { ForgotPassword } from "./pages/auth/ForgotPassword.jsx";
import { ResetPassword } from "./pages/auth/ResetPassword.jsx";

import { Wishlist } from "./pages/user/Wishlist.jsx";
import { UserDashboard } from "./pages/user/UserDashboard.jsx";

import { OwnerDashboard } from "./pages/owner/OwnerDashboard.jsx";
import { OwnerProperties } from "./pages/owner/OwnerProperties.jsx";
import { AddProperty } from "./pages/owner/AddProperty.jsx";
import { OwnerBookings } from "./pages/owner/OwnerBookings.jsx";
import VerifyMobile from "./pages/auth/VerifyMobile.jsx";
import BookingPage from "./pages/Booking.jsx";

function App() {
  // Restores session state (isLoggedIn/role) on a hard refresh by checking
  // the httpOnly cookie against whichever profile endpoint matches the
  // role we last remembered in localStorage.
  useAuthCheck();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<PropertiesListing />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/properties/booking/:id" element={<BookingPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifymobile/:mobile" element={<VerifyMobile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword role="user" />} />
        <Route path="/owner/forgot-password" element={<ForgotPassword />} />
        <Route path="/owner/reset-password/:token" element={<ResetPassword role="owner" />} />

        {/* Any authenticated role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* User only */}
        <Route element={<RoleProtectedRoute role="user" />}>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>

        {/* Owner only */}
        <Route element={<RoleProtectedRoute role="owner" />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/properties" element={<OwnerProperties />} />
          <Route path="/owner/properties/add" element={<AddProperty />} />
          <Route path="/owner/bookings" element={<OwnerBookings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
