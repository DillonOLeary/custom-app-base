import { get, post, put, postFormData } from '@/services/api/apiClient';
import { validateToken } from '@/utils/api-auth';

// Mock fetch and copilotApi
global.fetch = jest.fn();
jest.mock('copilot-node-sdk', () => ({
  copilotApi: jest.fn().mockImplementation(() => ({
    retrieveWorkspace: jest.fn().mockResolvedValue({}),
    getTokenPayload: jest.fn().mockResolvedValue({}),
  })),
}));

describe('API Client', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation for fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });
  });

  describe('get function', () => {
    test('should include token in query string when provided', async () => {
      // Call get with a token
      await get('/test-url', 'test-token');

      // Check if fetch was called with URL containing token
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-url') &&
          expect.stringContaining('token=test-token'),
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
  });

  describe('post function', () => {
    test('should include token in query string when provided', async () => {
      // Call post with a token
      await post('/test-url', { data: 'test' }, 'test-token');

      // Check if fetch was called with the correct URL and body
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('token=test-token'),
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
  });

  describe('put function', () => {
    test('should include token in query string when provided', async () => {
      // Call put with a token
      await put('/test-url', { data: 'test' }, 'test-token');

      // Check if fetch was called with the correct URL and body
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('token=test-token'),
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
        expect.stringContaining('token=test-token'),
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
  });
});
