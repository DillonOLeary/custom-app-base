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
export async function get<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error(`GET request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Post request with proper error handling
 */
export async function post<T, D = unknown>(url: string, data?: D): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error(`POST request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Put request with proper error handling
 */
export async function put<T, D = unknown>(url: string, data?: D): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error(`PUT request failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Post for form data with proper error handling
 */
export async function postFormData<T>(
  url: string,
  formData: FormData,
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error(`POST form data request failed for ${url}:`, error);
    throw error;
  }
}
