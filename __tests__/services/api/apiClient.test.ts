import {
  get,
  post,
  put,
  postFormData,
  handleApiResponse,
  API_BASE_URL,
} from '@/services/api/apiClient';
import { validateToken } from '@/utils/api-auth';

// Mock fetch and copilotApi
global.fetch = jest.fn();
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    retrieveWorkspace: jest.fn().mockResolvedValue({}),
    getTokenPayload: jest.fn().mockResolvedValue({}),
  })),
}));

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterAll(() => {
  process.env = originalEnv;
});

describe('API Client', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation for fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: 'test' }),
    });
  });

  describe('API_BASE_URL', () => {
    test('should use NEXT_PUBLIC_API_URL when available', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://test-api.example.com';
      // Need to re-import to test the variable with updated environment
      jest.isolateModules(() => {
        const { API_BASE_URL } = require('@/services/api/apiClient');
        expect(API_BASE_URL).toBe('https://test-api.example.com');
      });
    });

    test('should default to empty string when NEXT_PUBLIC_API_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      jest.isolateModules(() => {
        const { API_BASE_URL } = require('@/services/api/apiClient');
        expect(API_BASE_URL).toBe('');
      });
    });
  });

  describe('handleApiResponse', () => {
    test('should resolve with parsed JSON for successful responses', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: 'test data' }),
      };

      const result = await handleApiResponse(
        mockResponse as unknown as Response,
      );
      expect(result).toEqual({ success: true, data: 'test data' });
      expect(mockResponse.json).toHaveBeenCalled();
    });

    test('should throw error with status and text for unsuccessful responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Resource not found'),
      };

      await expect(
        handleApiResponse(mockResponse as unknown as Response),
      ).rejects.toThrow('API Error: 404 Not Found. Resource not found');
      expect(mockResponse.text).toHaveBeenCalled();
    });

    test('should handle missing statusText gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: '',
        text: jest.fn().mockResolvedValue('Internal server error'),
      };

      await expect(
        handleApiResponse(mockResponse as unknown as Response),
      ).rejects.toThrow('API Error: 500 Unknown status. Internal server error');
    });

    test('should handle error when getting response text', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockRejectedValue(new Error('Cannot parse response')),
      };

      await expect(
        handleApiResponse(mockResponse as unknown as Response),
      ).rejects.toThrow('API Error: 400 Bad Request. Unknown error');
    });
  });

  describe('get function', () => {
    test('should include token in query string when provided', async () => {
      // Call get with a token
      await get('/test-url', 'test-token');

      // Check if fetch was called with URL containing token
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-url?token=test-token'),
      );
    });

    test('should not include token in query string when not provided', async () => {
      // Call get without a token
      await get('/test-url');

      // Check if fetch was called with URL without token
      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('token='),
      );
    });

    test('should properly handle errors', async () => {
      const mockError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(get('/test-url')).rejects.toThrow('Network error');
    });

    test('should handle response errors through handleApiResponse', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest.fn().mockResolvedValue('Access denied'),
      });

      await expect(get('/test-url')).rejects.toThrow(
        'API Error: 403 Forbidden. Access denied',
      );
    });
  });

  describe('post function', () => {
    test('should include token in query string when provided', async () => {
      // Call post with a token
      await post('/test-url', { data: 'test' }, 'test-token');

      // Check if fetch was called with the correct URL and body
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-url?token=test-token'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: 'test' }),
        }),
      );
    });

    test('should not include token in query string when not provided', async () => {
      // Call post without a token
      await post('/test-url', { data: 'test' });

      // Check if fetch was called without token in URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('token='),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: 'test' }),
        }),
      );
    });

    test('should handle undefined data', async () => {
      // Call post with undefined data
      await post('/test-url', undefined);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: undefined,
        }),
      );
    });

    test('should properly handle errors', async () => {
      const mockError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(post('/test-url', { data: 'test' })).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('put function', () => {
    test('should include token in query string when provided', async () => {
      // Call put with a token
      await put('/test-url', { data: 'test' }, 'test-token');

      // Check if fetch was called with the correct URL and body
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-url?token=test-token'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: 'test' }),
        }),
      );
    });

    test('should not include token in query string when not provided', async () => {
      // Call put without a token
      await put('/test-url', { data: 'test' });

      // Check if fetch was called without token in URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('token='),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: 'test' }),
        }),
      );
    });

    test('should handle undefined data', async () => {
      // Call put with undefined data
      await put('/test-url', undefined);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: undefined,
        }),
      );
    });

    test('should properly handle errors', async () => {
      const mockError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(put('/test-url', { data: 'test' })).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('postFormData function', () => {
    test('should include token in query string when provided', async () => {
      // Create a mock FormData
      const formData = new FormData();
      formData.append(
        'file',
        new Blob(['test file content'], { type: 'text/plain' }),
        'test.txt',
      );

      // Call postFormData with a token
      await postFormData('/test-url', formData, 'test-token');

      // Check if fetch was called with the correct URL and body
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-url?token=test-token'),
        expect.objectContaining({
          method: 'POST',
          body: formData,
        }),
      );
    });

    test('should not include token in query string when not provided', async () => {
      // Create a mock FormData
      const formData = new FormData();
      formData.append(
        'file',
        new Blob(['test file content'], { type: 'text/plain' }),
        'test.txt',
      );

      // Call postFormData without a token
      await postFormData('/test-url', formData);

      // Check if fetch was called without token in URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('token='),
        expect.objectContaining({
          method: 'POST',
          body: formData,
        }),
      );
    });

    test('should properly handle errors', async () => {
      // Create a mock FormData
      const formData = new FormData();
      formData.append('file', new Blob(['test content']), 'test.txt');

      const mockError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(postFormData('/test-url', formData)).rejects.toThrow(
        'Network error',
      );
    });

    test('should handle response errors', async () => {
      // Create a mock FormData
      const formData = new FormData();
      formData.append('file', new Blob(['test content']), 'test.txt');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        text: jest.fn().mockResolvedValue('File size exceeds limit'),
      });

      await expect(postFormData('/test-url', formData)).rejects.toThrow(
        'API Error: 413 Payload Too Large. File size exceeds limit',
      );
    });
  });
});
