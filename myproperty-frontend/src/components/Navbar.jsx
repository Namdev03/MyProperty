import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  X,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Building2,
  Heart,
  LogOut,
  Bell,
} from "lucide-react";
import { toast } from "react-toastify";
import { logoutUser } from "../redux/slices/userSlice.js";
import { logoutOwner } from "../redux/slices/ownerSlice.js";

export function Navbar() {
  const list = [
    { id: 1, name: "Home", path: "/" },
    { id: 2, name: "Properties", path: "/properties" },
    { id: 3, name: "Contact", path: "/contact" },
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isActive = (path) => location.pathname === path;

  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const userProfile = useSelector((state) => state.user.profile);
  const ownerProfile = useSelector((state) => state.owner.profile);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const displayName =
    role === "owner" ? ownerProfile?.ownerName : userProfile?.fullName;
  const profileImage =
    role === "owner"
      ? ownerProfile?.companyLogo?.url
      : userProfile?.profileImage?.url;

  const fallbackAvatar =
    "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = () => {
    if (!search.trim()) return;
    navigate(`/properties?q=${encodeURIComponent(search.trim())}`);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setIsOpen(false);
    const action = role === "owner" ? logoutOwner() : logoutUser();
    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Logged out successfully");
      navigate("/");
    } else {
      toast.error(result.payload || "Logout failed");
    }
  };

  const dashboardPath = role === "owner" ? "/owner/dashboard" : "/dashboard";
  const propertiesPath = role === "owner" ? "/owner/properties" : "/wishlist";

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-[#E7E4DC] bg-[#FEFDFB]/90 shadow-md backdrop-blur-md"
            : "border-transparent bg-[#FEFDFB]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link
            to="/"
            className="shrink-0 font-serif text-2xl font-bold tracking-tight text-[#14213D] sm:text-[1.75rem]"
          >
            MyProperty
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {list.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`group relative py-1 text-[15px] font-medium transition-colors duration-200 ${
                    isActive(item.path) ? "text-[#14213D]" : "text-gray-500 hover:text-[#14213D]"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-[#2F6844] transition-all duration-300 ${
                      isActive(item.path) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex lg:flex-1 lg:max-w-xs xl:max-w-sm">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by city, area..."
                className="w-full rounded-full border border-[#E7E4DC] bg-white py-2.5 pl-4 pr-11 text-sm text-[#14213D] placeholder:text-gray-400 outline-none transition focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
              />
              <button
                onClick={handleSearch}
                aria-label="Search"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#14213D] p-2 text-white transition hover:bg-[#2F6844]"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#14213D] transition hover:bg-[#14213D]/5"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-[#14213D] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6844]"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  className="relative rounded-full p-2 text-gray-600 transition hover:bg-[#14213D]/5"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-[#14213D]/5"
                  >
                    <img
                      src={profileImage || fallbackAvatar}
                      alt="Profile"
                      className="h-9 w-9 rounded-full border-2 border-[#2F6844] object-cover"
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[#E7E4DC] bg-white py-2 shadow-lg transition-all duration-150 ${
                      profileOpen
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-1 opacity-0"
                    }`}
                  >
                    <Link
                      to={dashboardPath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-[#14213D]/5"
                    >
                      <LayoutDashboard size={16} className="text-[#2F6844]" />
                      Dashboard
                    </Link>
                    <Link
                      to={propertiesPath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-[#14213D]/5"
                    >
                      {role === "owner" ? (
                        <Building2 size={16} className="text-[#2F6844]" />
                      ) : (
                        <Heart size={16} className="text-[#2F6844]" />
                      )}
                      {role === "owner" ? "My Properties" : "Wishlist"}
                    </Link>
                    <div className="my-1 border-t border-[#E7E4DC]" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            className="text-[#14213D] lg:hidden"
          >
            <Menu size={26} />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/40" />

        <div
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-[#FEFDFB] shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E7E4DC] px-5 py-4">
            <span className="font-serif text-xl font-bold text-[#14213D]">MyProperty</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="text-[#14213D]">
              <X size={24} />
            </button>
          </div>

          <div className="flex h-[calc(100%-64px)] flex-col justify-between overflow-y-auto px-5 py-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by city, area..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 rounded-lg border border-[#E7E4DC] px-4 py-3 text-sm outline-none focus:border-[#2F6844]"
                />
                <button
                  onClick={handleSearch}
                  aria-label="Search"
                  className="rounded-lg bg-[#14213D] p-3 text-white transition hover:bg-[#2F6844]"
                >
                  <Search size={20} />
                </button>
              </div>

              <ul className="space-y-1 font-medium">
                {list.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-lg px-3 py-3 transition ${
                        isActive(item.path)
                          ? "bg-[#2F6844]/10 text-[#2F6844]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {isLoggedIn && (
                <ul className="space-y-1 border-t border-[#E7E4DC] pt-4 font-medium">
                  <li>
                    <Link
                      to={dashboardPath}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard size={18} className="text-[#2F6844]" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={propertiesPath}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      {role === "owner" ? (
                        <Building2 size={18} className="text-[#2F6844]" />
                      ) : (
                        <Heart size={18} className="text-[#2F6844]" />
                      )}
                      {role === "owner" ? "My Properties" : "Wishlist"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/notifications"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      <Bell size={18} className="text-[#2F6844]" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            <div className="pt-6">
              {!isLoggedIn ? (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg border border-[#14213D] py-3 text-center font-semibold text-[#14213D]"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg bg-[#14213D] py-3 text-center font-semibold text-white"
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-[#E7E4DC] p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={profileImage || fallbackAvatar}
                      alt="Profile"
                      className="h-11 w-11 rounded-full border-2 border-[#2F6844] object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#14213D]">
                        {displayName || "Welcome back"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="rounded-full p-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
