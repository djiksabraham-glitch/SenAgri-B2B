import api from "./api";

export const login = async (email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};

export const register = async (data) => {
    const response = await api.post("/auth/register", data);

    return response.data;
};

export const logout = async () => {
    const response = await api.post("/logout");

    return response.data;
};

export const me = async () => {
    const response = await api.get("/me");

    return response.data;
};