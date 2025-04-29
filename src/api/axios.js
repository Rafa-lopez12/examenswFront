import  axios  from "axios";


const instance=axios.create({ 
   baseURL:"https://examensw1.onrender.com/api", //https://wylsomgym.onrender.com/api
   // withCredentials:true
   //baseURL:"http://localhost:3000/api",
   timeout: 60000,
})
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

export default instance