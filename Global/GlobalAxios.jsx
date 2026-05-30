import axios from "axios";
import Cookies from "js-cookie"; // Ensure you have this package installed
import { nanoid } from "@reduxjs/toolkit";

// Base URL setup depending on whether the user is authenticated or a guest


const generateUUID = ()=>{
  if(Cookies.get('guestUUID')){
    return Cookies.get('guestUUID');
  }
  else{
    let guestUUID = nanoid();
    console.log("Generated UUID", guestUUID);
    Cookies.set("guestUUID", guestUUID, { expires: 1 });
    return guestUUID;
  }
}

let apiUrl = import.meta.env.VITE_API_URL || "https://api.danmartglobal.com/api/v1";
const token = Cookies.get("authToken");
const UUID = generateUUID();

if (token) {
  //console.log("Token", token);
  apiUrl += "/user";
} else {
  apiUrl += "/guest";
}

const GlobalAxios = axios.create({
  baseURL: apiUrl,
  headers: {
    Accept: "application/json",
  },
});

// Add a request interceptor to handle both user and guest scenarios
GlobalAxios.interceptors.request.use(
  (config) => {
    // If the user is authenticated, add the Bearer token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      //console.log("Token added to header", token);
    } else{
      // If the user is a guest, add the guest UUID
      config.headers["guest-uuid"] = UUID;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default GlobalAxios;