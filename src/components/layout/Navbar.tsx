import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import { cn } from "../../utils/cn";
import { dispatch, RootState } from "../../store";
import { sessionActions } from "../../store/actions/session.actions";
import IconImage from '../../assets/Voxlane_logo.png';
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";

const Navbar = () => {
  const {disconnectSocket} = useSocket()
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const { user } = useSelector((state: RootState) => state.sessionReducer);
  const { primaryMobileNumber } = useSelector((state: RootState) => state.userReducer);
  const userName = user?.['cognito:username'] || 'User'
  const userRole = user?.['custom:role'] || '';
  const isAdmin = userRole === 'Admin';
  
  // Get primary mobile number from localStorage for regular users
  const primaryUserNumber = !isAdmin 
    ? primaryMobileNumber || 'No phone' 
    : '';

  const handleLogout = () => {
    dispatch(sessionActions.logout(navigate));
    disconnectSocket()
  };

  // Admins see ONLY Settings; others see Cases, Mobile, Messages
  const navItems = isAdmin
    ? [{ name: "Settings", path: "/settings" }]
    : [
        { name: "Cases", path: "/cases" },
        { name: "Messages", path: "/messages" },
        { name: "Call Logs", path: "/callLogs" },
        { name: "Voice Mails", path: "/voiceMails" },
      ];

  return (
    <>
      <nav className="w-full bg-white shadow-sm border-b border-gray-200 z-40 fixed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to={isAdmin ? "/settings" : "/cases"} className="flex items-center space-x-3">
                  <div className="">
                    <img className="w-14 h-14" src={IconImage} alt="Icon" />
                  </div>
                  <span className="text-xl font-semibold text-gray-800">
                    Voxlane
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16",
                      location.pathname.startsWith(item.path)
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  {isAdmin && (
                    <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                      For Admin Use
                    </span>
                  )}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      {user?.name?.charAt(0) || <User size={20} />}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {userName}
                      </div>
                      {!isAdmin && primaryUserNumber && (
                        <div className="text-xs text-gray-500">
                          {primaryUserNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="flex items-center text-sm text-gray-700 hover:bg-gray-100 px-2 py-2 rounded"
                    onClick={() => setIsLogoutDialogOpen(true)}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="block h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                    location.pathname.startsWith(item.path)
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user?.name?.charAt(0) || <User size={24} />}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {!isAdmin ? primaryUserNumber : 'Admin'}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {isAdmin && (
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                )}
                <button
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutDialogOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;