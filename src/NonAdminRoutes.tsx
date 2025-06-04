// NonAdminRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "./store";

const NonAdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useSelector((state: RootState) => state.sessionReducer);
  const userRole = user?.["custom:role"];

  if (userRole === "Admin") {
    return <Navigate to="/settings" replace />;
  }

  return children;
};

export default NonAdminRoute;
