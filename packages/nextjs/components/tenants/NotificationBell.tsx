import { Bell } from "lucide-react";

export default function NotificationBell({ count = 2 }) {
  return (
    <div className="relative w-fit">
      <Bell className="w-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 font-bold text-white bg-blue-500 rounded-full px-1 text-xs">
          {count}
        </span>
      )}
    </div>
  );
}
