import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services";

const SiteBanner = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authService.logout();
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="sticky top-0 z-50 w-full h-40 bg-black px-4 py-2 text-center text-3xl font-bold uppercase tracking-[0.5em] text-white shadow-sm">
      lol!, lets do some fun work
    </div>
  );
};

export default SiteBanner;
