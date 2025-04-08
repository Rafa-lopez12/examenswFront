
import instance from './axios';

export const registerRequest=(user)=>instance.post(`/auth/register`,user);

export const loginRequest=(user)=>instance.post(`/auth/login`, user);

export const verifyAuthentificated=()=>instance.get('/auth')

export const verifyTokenRequest=()=>instance.get('/auth/check-status')