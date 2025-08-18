import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SplitwiseCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const accessTokenSecret = params.get("access_token_secret");

    if (accessToken && accessTokenSecret) {
      localStorage.setItem("splitwise_access_token", accessToken);
      localStorage.setItem("splitwise_access_token_secret", accessTokenSecret);
    }

    navigate("/");
  }, [location, navigate]);

  return (
    <div>
      <p>Authenticating with Splitwise...</p>
    </div>
  );
}
