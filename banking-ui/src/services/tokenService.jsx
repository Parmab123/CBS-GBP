import api from "./api";

export const refreshToken = async () => {

    const refreshToken = localStorage.getItem("refreshToken");

    const res = await api.post("/auth/refresh", {
        refreshToken
    });

    localStorage.setItem("accessToken", res.data.accessToken);

    return res.data.accessToken;

};