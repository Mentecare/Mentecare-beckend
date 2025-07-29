import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.mentecare.com.br',
});

export default api;
