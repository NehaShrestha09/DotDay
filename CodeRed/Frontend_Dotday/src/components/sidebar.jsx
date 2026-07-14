import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Home,
  Calendar,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Settings,
  Menu,
  User,
  HelpCircle,
} from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState("User");
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Get display name from Google account
        const displayName = user.displayName || user.email?.split('@')[0] || "User";
        setUserName(displayName);
      } else {
        setUserName("User");
      }
    });

    return () => unsubscribe();
  }, []);

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: TrendingUp, label: "Insights", href: "/insights" },
    { icon: BookOpen, label: "My Diary", href: "/mydiary" },
    { icon: Lightbulb, label: "Care Tips", href: "/caretips" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "FAQ", href: "/faq" },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-screen bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out`}
    >
      {/* Top Section (Logo + Toggle) */}
      <div>
        <div
          className={`h-16 flex items-center border-b border-gray-100 px-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <img
              src="../icons/logo.png"
              alt="DotDay Logo"
              className="h-20 w-auto"
            />
          )}
          <button
            onClick={toggleSidebar}
            className={`rounded-lg hover:bg-gray-100 transition duration-200 flex items-center justify-center ${
              isCollapsed ? "p-2" : "p-3"
            }`}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center px-2" : "space-x-3 px-4"
                    } py-3 rounded-lg transition-colors duration-200 group relative
                      ${
                        isActive
                          ? "bg-pink-100 text-pink-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-pink-600"
                      }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive
                          ? "text-pink-600"
                          : "text-gray-500 group-hover:text-pink-600"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Profile Section - Static Display */}
      <div className="p-4 border-t border-gray-100">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "space-x-3"
          } p-2 rounded-lg`}
        >
          <User className="w-6 h-6 text-gray-600" />
          {!isCollapsed && (
            <span className="text-gray-700 font-medium">{userName}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;