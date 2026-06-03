const API_BASE = '/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; message: string }>('/auth/login', { method: 'POST', body: { username, password } }),
  verify: () => request<{ valid: boolean }>('/auth/verify'),
  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/password', { method: 'PUT', body: { oldPassword, newPassword } }),
  getSecurityQuestion: (username: string) =>
    request<{ question: string }>('/auth/forgot-question', { method: 'POST', body: { username } }),
  resetPassword: (username: string, answer: string, newPassword: string) =>
    request<{ message: string }>('/auth/forgot-reset', { method: 'POST', body: { username, answer, newPassword } }),
};

// Posts API
export const postsApi = {
  list: () => request<any[]>('/posts'),
  getBySlug: (slug: string) => request<any>(`/posts/${slug}`),
  adminList: () => request<any[]>('/posts/admin/all'),
  adminGet: (id: number) => request<any>(`/posts/admin/${id}`),
  create: (data: any) => request<any>('/posts', { method: 'POST', body: data }),
  update: (id: number, data: any) => request<any>(`/posts/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) => request<any>(`/posts/${id}`, { method: 'DELETE' }),
};

// Projects API
export const projectsApi = {
  list: () => request<any[]>('/projects'),
  adminList: () => request<any[]>('/projects/admin/all'),
  create: (data: any) => request<any>('/projects', { method: 'POST', body: data }),
  update: (id: number, data: any) => request<any>(`/projects/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) => request<any>(`/projects/${id}`, { method: 'DELETE' }),
};

// Timeline API
export const timelinesApi = {
  list: () => request<any[]>('/timelines'),
  adminList: () => request<any[]>('/timelines/admin/all'),
  create: (data: any) => request<any>('/timelines', { method: 'POST', body: data }),
  update: (id: number, data: any) => request<any>(`/timelines/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) => request<any>(`/timelines/${id}`, { method: 'DELETE' }),
};

// Profile API
export const profileApi = {
  get: () => request<{ profile: any; skills: any[]; gears: any[]; interests: any[] }>('/profile'),
  update: (data: any) => request<any>('/profile', { method: 'PUT', body: data }),
  updateSkills: (skills: any[]) => request<any>('/profile/skills', { method: 'PUT', body: { skills } }),
};
