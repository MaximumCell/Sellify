import { Link } from "react-router-dom";
import { Lock, LogIn, LogOut, ShoppingCart, UserPlus } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg transition-all duration-300 border-emerald-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap">
        <Link
          to="/"
          className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex"
        >
          Sellify
        </Link>
        <nav className="flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="text-gray-300 hover:text-emerald-400 transition duration-300"
          >
            Home
          </Link>
          {user && (
            <Link
              to="/cart"
              className="text-gray-300 hover:text-emerald-400 transition duration-300 relative"
            >
              <ShoppingCart
                className="inline-block mr-1 group-hover:bg-emerald-400"
                size={20}
              />
              <span className="hidden sm:inline-block">Cart</span>
              <span className="absolute -top-2 -left-2 bg-emerald-500 text-white text-xs rounded-full px-2 py-0.5 group-hover:bg-emerald-400 transition duration-300 ease-in-out">
                3
              </span>
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="bg-emerald-700 hover:text-emerald-400 transition duration-300 text-white px-3 py-1 rounded-md font-medium ease-in-out flex items-center"
            >
              <Lock className="inline-block mr-1" size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
          {user ? (
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out" onClick={logout}>
              <LogOut size={18} />
              <span className="hidden sm:inline ml-2">Log Out</span>
            </button>
          ) : (
            <>
              <Link
                to={"/signup"}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300ease-in-out">
                <UserPlus className="mr-2" size={18} />
                Sign Up
              </Link>
              <Link
                to={"/login"}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
              >
                <LogIn className="mr-2" size={18} />
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
