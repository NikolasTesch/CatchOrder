export class ApiService {
    private static get baseUrl(): string {
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3000/api';
        }
        return window.location.pathname.includes('/server09/') ? '/server09/api' : '/api';
    }

    static async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include', // Ensure cookies are sent
        });

        return this.handleResponse<T>(response);
    }

    static async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies are sent
        });

        return this.handleResponse<T>(response);
    }

    static async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    static async patch<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    static async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return this.handleResponse<T>(response);
    }

    private static async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type');
        let data: any;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const errorMessage = data.errors && Array.isArray(data.errors)
                ? `${data.message}: ${data.errors.join(', ')}`
                : (data.message || 'Erro na requisição');
            throw new Error(errorMessage);
        }

        return data as T;
    }
}
