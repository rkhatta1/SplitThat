import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("jwt", token);
    }

    navigate("/");
  }, [location, navigate]);

  return (
    <div>
      <p>Login successful, redirecting...</p>
    </div>
  );
}
