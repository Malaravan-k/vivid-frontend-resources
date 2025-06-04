import { useSelector } from "react-redux";
import { RootState } from "./store";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.sessionReducer.user);
  const role = user?.['custom:role'];

  if (role !== 'Admin') {
    return <div className="p-8 text-red-600 text-xl">🚫 You do not have access to this page.</div>;
  }

  return children;
};

export default AdminRoute;
