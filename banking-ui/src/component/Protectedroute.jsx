import {useEffect} from "react";
import {useNavigate} from "react-router-dom";


const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));  // decode JWT payload
        const expiry = payload.exp * 1000;                     // exp is in seconds
        return Date.now() > expiry;
    } catch {
        return true; // if token is malformed treat as expired
    }
};

export default function ProtectedRoute({children}) {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token || isTokenExpired(token)) {
            // Clear everything and force back to login
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/login", {replace: true});
        }
    }, []); // runs once on every mount = every page load / refresh

    // If no token, render nothing while redirect happens
    const token = localStorage.getItem("accessToken");
    if (!token || isTokenExpired(token)) return null;

    return children;
}