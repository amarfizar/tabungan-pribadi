import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: false, // Sanctum token-based, not cookie-based
    });

    // Request interceptor: attach token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor: handle 401, 422, etc.
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;

        if (status === 401) {
          // Token kedaluwarsa/tidak valid — bersihkan token dan kabarkan ke AuthContext
          // agar guard halaman yang melakukan redirect (bukan dari sini).
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  clearToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.client.post('/register', data);
  }

  async login(data: { email: string; password: string }) {
    return this.client.post('/login', data);
  }

  async logout() {
    return this.client.post('/logout');
  }

  async getUser() {
    return this.client.get('/user');
  }

  // Transaction endpoints
  async getTransactions(params?: {
    type?: string;
    category?: string;
    period?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
  }) {
    return this.client.get('/transactions', { params });
  }

  async getTransaction(id: number) {
    return this.client.get(`/transactions/${id}`);
  }

  async createTransaction(data: {
    type: 'income' | 'expense' | 'saving';
    category: string;
    amount: number;
    note?: string;
    transaction_date: string;
  }) {
    return this.client.post('/transactions', data);
  }

  async updateTransaction(
    id: number,
    data: {
      type: 'income' | 'expense' | 'saving';
      category: string;
      amount: number;
      note?: string;
      transaction_date: string;
    }
  ) {
    return this.client.put(`/transactions/${id}`, data);
  }

  async deleteTransaction(id: number) {
    return this.client.delete(`/transactions/${id}`);
  }

  // Saving Goal endpoints
  async getGoals(params?: { status?: string }) {
    return this.client.get('/goals', { params });
  }

  async getGoal(id: number) {
    return this.client.get(`/goals/${id}`);
  }

  async createGoal(data: {
    name: string;
    target_amount: number;
    deadline?: string | null;
  }) {
    return this.client.post('/goals', data);
  }

  async updateGoal(
    id: number,
    data: {
      name?: string;
      target_amount?: number;
      deadline?: string | null;
      status?: 'active' | 'completed' | 'archived';
    }
  ) {
    return this.client.put(`/goals/${id}`, data);
  }

  async deleteGoal(id: number) {
    return this.client.delete(`/goals/${id}`);
  }

  async depositGoal(id: number, data: { amount: number; note?: string; transaction_date?: string }) {
    return this.client.post(`/goals/${id}/deposit`, data);
  }

  // Dashboard & Statistics
  async getDashboard(params?: { month?: number; year?: number }) {
    return this.client.get('/dashboard', { params });
  }

  async getStatistics(params?: { month?: number; year?: number }) {
    return this.client.get('/statistics', { params });
  }

  // User endpoints
  async updateUser(data: { name: string; email: string }) {
    return this.client.put('/user', data);
  }

  async updatePassword(data: { current_password: string; password: string; password_confirmation: string }) {
    return this.client.put('/user/password', data);
  }
}

// Singleton instance
export const api = new ApiClient();

/**
 * Pesan error yang aman ditampilkan ke pengguna dari kegagalan request API.
 * Prioritas: pesan validasi field -> pesan error API -> pesan bawaan.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    }).response;

    const firstValidationError = Object.values(response?.data?.errors ?? {})[0]?.[0];

    return firstValidationError ?? response?.data?.message ?? fallback;
  }

  return fallback;
}

/**
 * Ekstrak pesan validasi per field dari respons 422, hanya untuk field yang diminta.
 */
export function apiValidationErrors(error: unknown, fields: readonly string[]): Record<string, string> {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return {};
  }

  const errors =
    (error as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors ?? {};

  const result: Record<string, string> = {};

  for (const field of fields) {
    if (Array.isArray(errors[field]) && errors[field].length > 0) {
      result[field] = errors[field][0];
    }
  }

  return result;
}

// Initialize token from localStorage on client side
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('access_token');
  if (storedToken) {
    api.setToken(storedToken);
  }
}