import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, BellOff } from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../redux/slices/notificationSlice.js";
import { Loader } from "../components/Loader.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

export function Notifications() {
  const dispatch = useDispatch();
  const { list, loading, unreadCount } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#14213D]">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => dispatch(markAllNotificationsRead())}
            className="text-sm font-semibold text-[#2F6844] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" message="You'll see booking updates here." />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && dispatch(markNotificationRead(n._id))}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                n.isRead ? "border-[#E7E4DC] bg-white" : "border-[#2F6844]/30 bg-[#2F6844]/5"
              }`}
            >
              <div className="rounded-full bg-[#14213D]/5 p-2">
                <Bell size={16} className="text-[#14213D]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#14213D]">{n.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2F6844]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
