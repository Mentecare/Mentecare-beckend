// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Classe para gerenciar requisições à API
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Método para fazer requisições HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos de autenticação
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async getProfile() {
    return await this.request('/users/profile');
  }

  async updateProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // Métodos para profissionais
  async searchProfessionals(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/professionals/search${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint);
  }

  async getProfessionalDetails(professionalId) {
    return await this.request(`/professionals/${professionalId}`);
  }

  async getProfessionalAvailability(professionalId) {
    return await this.request(`/professionals/${professionalId}/availability`);
  }

  async getProfessionalReviews(professionalId, page = 1) {
    return await this.request(`/professionals/${professionalId}/reviews?page=${page}`);
  }

  async getSpecialties() {
    return await this.request('/professionals/specialties');
  }

  // Métodos para consultas
  async bookAppointment(appointmentData) {
    return await this.request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getMyAppointments(status = null, page = 1) {
    const queryParams = new URLSearchParams({ page });
    if (status) {
      queryParams.append('status', status);
    }
    
    return await this.request(`/appointments/my-appointments?${queryParams}`);
  }

  async getAppointmentDetails(appointmentId) {
    return await this.request(`/appointments/${appointmentId}`);
  }

  async cancelAppointment(appointmentId) {
    return await this.request(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
    });
  }

  async completeAppointment(appointmentId, notes = '') {
    return await this.request(`/appointments/${appointmentId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  async createReview(appointmentId, rating, comment = '') {
    return await this.request(`/appointments/${appointmentId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  // Método para verificar se o usuário está autenticado
  isAuthenticated() {
    return !!this.token;
  }

  // Método para obter dados do usuário do localStorage
  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Método para health check
  async healthCheck() {
    return await this.request('/health');
  }
}

// Instância singleton da API
const api = new ApiClient();

export default api;

