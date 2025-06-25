import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, Settings, Phone, MessageSquare, Voicemail, Clipboard, ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";
import { dispatch, RootState } from "../../store";
import { sessionActions } from "../../store/actions/session.actions";
import IconImage from '../../assets/voxlaneLogo.png';
import { useSelector } from "react-redux";
import { useCall } from "../../context/CallContext";

const Navbar = () => {
  const { disconnectSocket } = useCall();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { user } = useSelector((state: RootState) => state.sessionReducer);
  const { primaryMobileNumber } = useSelector((state: RootState) => state.userReducer);
  const userName = user?.['cognito:username'] || 'User';
  const userRole = user?.['custom:role'] || '';
  const isAdmin = userRole === 'Admin';
  
  const primaryUserNumber = !isAdmin 
    ? primaryMobileNumber || 'No phone' 
    : '';

  const handleLogout = () => {
    dispatch(sessionActions.logout(navigate));
    disconnectSocket();
  };

  const navItems = isAdmin
    ? [{ 
        name: "Settings", 
        path: "/settings",
        icon: <Settings className="w-5 h-5" />
      }]
    : [
        { 
          name: "Cases", 
          path: "/cases",
          icon: <Clipboard className="w-5 h-5" />
        },
        { 
          name: "Messages", 
          path: "/messages",
          icon: <MessageSquare className="w-5 h-5" />
        },
        { 
          name: "Call Logs", 
          path: "/callLogs",
          icon: <Phone className="w-5 h-5" />
        },
        { 
          name: "Voice Mails", 
          path: "/voiceMails",
          icon: <Voicemail className="w-5 h-5" />
        },
      ];

  return (
    <>
      <nav className="w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm z-40 fixed">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex justify-between h-16 items-center">
            {/* Logo and Main Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to={isAdmin ? "/settings" : "/cases"} className="flex items-center space-x-3 group">
                  <img 
                    className="w-14 h-14 transition-transform duration-300 group-hover:scale-110" 
                    src={IconImage} 
                    alt="Voxlane Logo" 
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Voxlane
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      location.pathname.startsWith(item.path)
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-inner"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50/50"
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                    {location.pathname.startsWith(item.path) && (
                      <span className="ml-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Profile and Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin && (
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                  Admin Mode
                </span>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                      {user?.name?.charAt(0) || <User size={16} />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{userName}</div>
                    {!isAdmin && primaryUserNumber && (
                      <div className="text-xs text-gray-500">{primaryUserNumber}</div>
                    )}
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                  >
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Signed in as</p>
                        <p className="text-sm text-gray-500 truncate">{userName}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsLogoutDialogOpen(true);
                        }}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="block h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-xl rounded-b-lg animate-fade-in" id="mobile-menu">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-lg text-base font-medium",
                    location.pathname.startsWith(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                  {location.pathname.startsWith(item.path) && (
                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 px-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {user?.name?.charAt(0) || <User size={20} />}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-900">
                    {userName}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {!isAdmin ? primaryUserNumber : 'Administrator'}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm mx-4 border border-gray-100 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Ready to leave?</h3>
              <div className="mt-2 text-sm text-gray-500">
                Are you sure you want to sign out? Any unsaved changes may be lost.
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
                onClick={() => setIsLogoutDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-all duration-150"
                onClick={() => {
                  setIsLogoutDialogOpen(false);
                  handleLogout();
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;