import { Navigate } from "react-router-dom";
import { getLoggedInUser } from "@/lib/storage";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const { isLoggedIn } = getLoggedInUser();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
