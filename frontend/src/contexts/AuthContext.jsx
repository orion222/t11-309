import React, { createContext, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// TODO: get the BACKEND_URL.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(async () => {
        const token = localStorage.getItem("token");
        if (token){
            const res = await fetch (`${BACKEND_URL}/user/me`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.status === 200){
                setUser(data['user']);
            }
            else {
                return data.message;
            }
        }
        return null;
    }, [])

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        setUser(null);
        localStorage.clear();
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        const res = await fetch (`${BACKEND_URL}/login`, {
            method: "POST",
            body: JSON.stringify({ username, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json();
        if (res.status === 200){
            localStorage.setItem("token", data.token);
            const profileRes = await fetch(`${BACKEND_URL}/user/me`, {
                method: "GET",
                headers: {Authorization: `Bearer ${data.token}`}
            })
            const profile = await profileRes.json();
            if (profileRes.status === 200){
                setUser(profile['user']);
                navigate('/profile');
            }
            else {
                return data.message
            }
        }
        else {
            return data.message;
       }
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        const res = await fetch(`${BACKEND_URL}/register`, {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json();
        if (res.status === 201) {
            setUser(data['user']);
            navigate('/success');
        }
        else {
            return data.message;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
