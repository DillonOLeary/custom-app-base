/**
 * A simple API client with standard fetch wrappers and error handling
 */

// Base URL is inferred based on environment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Generic function to handle API response errors
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    const statusText = response.statusText || 'Unknown status';
    throw new Error(
      `API Error: ${response.status} ${statusText}. ${errorText}`,
    );
  }

  return (await response.json()) as T;
}

/**
 * Get request with proper error handling
 */
export async function get<T>(url: string, token?: string): Promise<T> {
  try {
    // Add token to URL as a query parameter
    const urlObj = new URL(url, window.location.origin);
    if (token) {
      urlObj.searchParams.set('token', token);
    }

    const response = await fetch(urlObj.toString());
    return await handleApiResponse<T>(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Post request with proper error handling
 */
export async function post<T, D = unknown>(
  url: string,
  data?: D,
  token?: string,
): Promise<T> {
  try {
    // Add token to URL as a query parameter
    const urlObj = new URL(url, window.location.origin);
    if (token) {
      urlObj.searchParams.set('token', token);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Put request with proper error handling
 */
export async function put<T, D = unknown>(
  url: string,
  data?: D,
  token?: string,
): Promise<T> {
  try {
    // Add token to URL as a query parameter
    const urlObj = new URL(url, window.location.origin);
    if (token) {
      urlObj.searchParams.set('token', token);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(urlObj.toString(), {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Post for form data with proper error handling
 */
export async function postFormData<T>(
  url: string,
  formData: FormData,
  token?: string,
): Promise<T> {
  try {
    // Add token to URL as a query parameter
    const urlObj = new URL(url, window.location.origin);
    if (token) {
      urlObj.searchParams.set('token', token);
    }

    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      body: formData,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    throw error;
  }
}
