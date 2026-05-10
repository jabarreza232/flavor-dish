import { TokenManager } from './tokenManager';
import { api } from '../api/client';

export const JWTMiddleware = {
  async verifyToken(): Promise<{ valid: boolean; token?: string; error?: string }> {
    try {
      const token = await TokenManager.getAccessToken();

      if (!token) {
        return { valid: false, error: 'No token found' };
      }

      if (TokenManager.isTokenExpired(token)) {
        // Coba refresh token
        const refreshToken = await TokenManager.getRefreshToken();
        if (refreshToken) {
          try {
            const response = await api.post('/auth/refresh', {
              refreshToken,
            });

            await TokenManager.saveToken(
              response.data.accessToken,
              response.data.refreshToken
            );

            return { valid: true, token: response.data.accessToken };
          } catch (error) {
            // Refresh gagal, logout
            await TokenManager.removeTokens();
            return { valid: false, error: 'Token refresh failed' };
          }
        }

        return { valid: false, error: 'Token expired and no refresh token' };
      }

      return { valid: true, token };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, error: String(error) };
    }
  },

  async addAuthHeader(headers: any) {
    const token = await TokenManager.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
};