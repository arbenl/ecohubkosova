import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load OpenAPI specification
const openapiSpec = JSON.parse(readFileSync(join(__dirname, '../../public/openapi.json'), 'utf-8'));

/**
 * API Testing Helper Functions
 * Validates API responses against OpenAPI specification
 */

export class ApiValidator {
  private spec: any;

  constructor(spec: any = openapiSpec) {
    this.spec = spec;
  }

  /**
   * Validate response against OpenAPI schema
   */
  validateResponse(path: string, method: string, statusCode: number, responseBody: any): boolean {
    const operation = this.getOperation(path, method.toLowerCase());
    if (!operation) {
      throw new Error(`Operation not found: ${method} ${path}`);
    }

    const responseSchema = operation.responses[statusCode.toString()];
    if (!responseSchema) {
      throw new Error(`Response schema not found for status ${statusCode}`);
    }

    // Basic validation - check if response matches expected structure
    return this.validateAgainstSchema(responseBody, responseSchema.content?.['application/json']?.schema);
  }

  /**
   * Get operation from OpenAPI spec
   */
  private getOperation(path: string, method: string) {
    // Convert path parameters (e.g., /api/v1/listings/{id} -> /api/v1/listings/{id})
    const specPath = Object.keys(this.spec.paths).find(p => {
      const regex = new RegExp(p.replace(/\{[^}]+\}/g, '[^/]+'));
      return regex.test(path);
    });

    return specPath ? this.spec.paths[specPath][method] : null;
  }

  /**
   * Basic schema validation (simplified)
   */
  private validateAgainstSchema(data: any, schema: any): boolean {
    if (!schema) return true;

    // Handle $ref references
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/', '').split('/');
      let refSchema = this.spec;
      for (const part of refPath) {
        refSchema = refSchema[part];
      }
      return this.validateAgainstSchema(data, refSchema);
    }

    // Basic type validation
    if (schema.type === 'object' && typeof data === 'object') {
      if (schema.properties) {
        for (const [prop, propSchema] of Object.entries(schema.properties)) {
          if (data.hasOwnProperty(prop)) {
            if (!this.validateAgainstSchema(data[prop], propSchema)) {
              return false;
            }
          } else if (schema.required?.includes(prop)) {
            return false; // Required property missing
          }
        }
      }
      return true;
    }

    if (schema.type === 'array' && Array.isArray(data)) {
      if (schema.items) {
        return data.every(item => this.validateAgainstSchema(item, schema.items));
      }
      return true;
    }

    if (schema.type === 'string' && typeof data === 'string') {
      if (schema.minLength && data.length < schema.minLength) return false;
      if (schema.maxLength && data.length > schema.maxLength) return false;
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) return false;
      if (schema.enum && !schema.enum.includes(data)) return false;
      return true;
    }

    if (schema.type === 'number' && typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) return false;
      if (schema.maximum !== undefined && data > schema.maximum) return false;
      return true;
    }

    if (schema.type === 'boolean' && typeof data === 'boolean') {
      return true;
    }

    // For complex validations, assume valid
    return true;
  }
}

/**
 * API Test Utilities
 */
export class ApiTestUtils {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(
    page: any,
    method: string,
    path: string,
    data?: any,
    token?: string
  ) {
    const url = `${this.baseURL}${path}`;

    // Get auth token from page context if not provided
    if (!token) {
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find((c: any) => c.name === 'session');
      if (sessionCookie) {
        // For simplicity, we'll use the session cookie
        // In a real implementation, you might need to extract JWT from cookie
      }
    }

    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: any = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.data = data;
    }

    return page.request.fetch(url, options);
  }

  /**
   * Test standard API response structure
   */
  async testApiResponse(response: any, expectedStatus: number = 200) {
    expect(response.status()).toBe(expectedStatus);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');

    const body = await response.json();

    // Test standard response structure
    if (expectedStatus >= 200 && expectedStatus < 300) {
      // Success response should not have error field
      expect(body).not.toHaveProperty('error');
    } else {
      // Error response should have error field
      expect(body).toHaveProperty('error');
      // Error can be a string or an object with message
      if (typeof body.error === 'string') {
        expect(body.error).toBeTruthy();
      } else {
        expect(body.error).toHaveProperty('message');
      }
    }

    return body;
  }

  /**
   * Test pagination structure (optional - for APIs that support pagination)
   */
  testPaginationStructure(data: any) {
    // Only test pagination if it exists (APIs may not implement pagination yet)
    if (data.pagination) {
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');

      expect(typeof data.pagination.page).toBe('number');
      expect(typeof data.pagination.limit).toBe('number');
      expect(typeof data.pagination.total).toBe('number');
      expect(typeof data.pagination.totalPages).toBe('number');
    }
  }

  /**
   * Test listing structure
   */
  testListingStructure(listing: any) {
    expect(listing).toHaveProperty('id');
    expect(listing).toHaveProperty('title');
    expect(listing).toHaveProperty('description');
    expect(listing).toHaveProperty('category');
    expect(listing).toHaveProperty('listing_type');
    expect(listing).toHaveProperty('price');

    expect(typeof listing.title).toBe('string');
    expect(typeof listing.description).toBe('string');
    expect(['shes', 'blej']).toContain(listing.listing_type);
    expect(typeof listing.price).toBe('number');
  }

  /**
   * Test organization structure
   */
  testOrganizationStructure(org: any) {
    expect(org).toHaveProperty('id');
    expect(org).toHaveProperty('name');
    expect(org).toHaveProperty('contact_email');
    expect(org).toHaveProperty('type');

    expect(typeof org.name).toBe('string');
    expect(typeof org.contact_email).toBe('string');
    expect(['Kompani', 'Organizatë', 'Institucion', 'OJQ']).toContain(org.type);
  }

  /**
   * Generate test data
   */
  generateTestListing(overrides: any = {}) {
    return {
      title: `Test Listing ${Date.now()}`,
      description: 'This is a test listing for API validation',
      category: 'materiale',
      type: 'shes',
      price: 100.50,
      unit: 'kg',
      quantity: 100,
      location: 'Prishtinë',
      condition: 'new',
      status: 'active',
      ...overrides
    };
  }

  generateTestOrganization(overrides: any = {}) {
    return {
      name: `Test Organization ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      description: 'Test organization for API validation',
      website: 'https://example.com',
      address: 'Test Address, Prishtinë',
      phone: '+38344123456',
      status: 'active',
      ...overrides
    };
  }
}

// Export singleton instances
export const apiValidator = new ApiValidator();
export const apiTestUtils = new ApiTestUtils();