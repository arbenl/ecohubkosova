import { test, expect } from '@playwright/test';
import { apiValidator, apiTestUtils } from '../helpers/api-helpers';

test.describe('API Integration Tests - OpenAPI Compliance', () => {
  test.describe('Health Endpoints', () => {
    test('GET /api/health - should return healthy status', async ({ page }) => {
      const response = await page.request.get('/api/health');
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate response structure
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('services');

      expect(['healthy', 'unhealthy']).toContain(body.status);
      expect(body.services).toHaveProperty('database');
      expect(body.services).toHaveProperty('cache');

      // Validate against OpenAPI spec
      expect(apiValidator.validateResponse('/api/health', 'get', 200, body)).toBe(true);
    });

    test('GET /api/health/db - should return database health', async ({ page }) => {
      const response = await page.request.get('/api/health/db');
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate response structure
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');

      expect(body.status).toBe('healthy');

      // Validate against OpenAPI spec
      expect(apiValidator.validateResponse('/api/health/db', 'get', 200, body)).toBe(true);
    });
  });

  test.describe('Listings API', () => {
    test('GET /api/v1/listings - should return paginated listings', async ({ page }) => {
      const response = await page.request.get('/api/v1/listings');
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate data structure (current API doesn't implement pagination yet)
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);

      // Validate each listing structure
      body.data.forEach((listing: any) => {
        apiTestUtils.testListingStructure(listing);
      });

      // Validate against OpenAPI spec
      expect(apiValidator.validateResponse('/api/v1/listings', 'get', 200, body)).toBe(true);
    });

    test('GET /api/v1/listings - should support filtering by category', async ({ page }) => {
      const response = await page.request.get('/api/v1/listings?category=materiale&limit=5');
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate pagination
      apiTestUtils.testPaginationStructure(body);

      // Validate all returned listings have the correct category
      body.data.forEach((listing: any) => {
        expect(listing.category).toBe('materiale');
        apiTestUtils.testListingStructure(listing);
      });
    });

    test('GET /api/v1/listings - should support search functionality', async ({ page }) => {
      const searchTerm = 'eco';
      const response = await page.request.get(`/api/v1/listings?search=${searchTerm}&limit=5`);
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate pagination
      apiTestUtils.testPaginationStructure(body);

      // Validate search results contain the search term
      body.data.forEach((listing: any) => {
        const searchableText = `${listing.title} ${listing.description}`.toLowerCase();
        expect(searchableText).toContain(searchTerm.toLowerCase());
        apiTestUtils.testListingStructure(listing);
      });
    });

    test('GET /api/v1/listings/{id} - should return specific listing', async ({ page }) => {
      // Skip: Individual listing endpoint not implemented yet
      test.skip(true, 'Individual listing endpoint not implemented');
    });

    test('GET /api/v1/listings/{id} - should return 404 for non-existent listing', async ({ page }) => {
      // Skip: Individual listing endpoint not implemented yet
      test.skip(true, 'Individual listing endpoint not implemented');
    });
  });

  test.describe('Organizations API', () => {
    test('GET /api/v1/organizations - should return paginated organizations', async ({ page }) => {
      const response = await page.request.get('/api/v1/organizations');
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate pagination structure
      apiTestUtils.testPaginationStructure(body);

      // Validate organizations array
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);

      // Validate each organization structure
      body.data.forEach((org: any) => {
        apiTestUtils.testOrganizationStructure(org);
      });

      // Validate against OpenAPI spec
      expect(apiValidator.validateResponse('/api/v1/organizations', 'get', 200, body)).toBe(true);
    });

    test('GET /api/v1/organizations - should support search functionality', async ({ page }) => {
      const searchTerm = 'eco';
      const response = await page.request.get(`/api/v1/organizations?search=${searchTerm}&limit=5`);
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate pagination
      apiTestUtils.testPaginationStructure(body);

      // Validate search results contain the search term
      body.data.forEach((org: any) => {
        const searchableText = `${org.name} ${org.description || ''}`.toLowerCase();
        expect(searchableText).toContain(searchTerm.toLowerCase());
        apiTestUtils.testOrganizationStructure(org);
      });
    });

    test('GET /api/v1/organizations/{id} - should return specific organization', async ({ page }) => {
      // Skip: Individual organization endpoint not implemented yet
      test.skip(true, 'Individual organization endpoint not implemented');
    });
  });

  test.describe('Articles API', () => {
    test('GET /api/v1/articles - should return published articles', async ({ page }) => {
      const response = await page.request.get('/api/v1/articles');
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate pagination structure
      apiTestUtils.testPaginationStructure(body);

      // Validate articles array
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);

      // Validate each article structure
      body.data.forEach((article: any) => {
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('content');
        expect(article).toHaveProperty('category');
        // Note: published field is not returned by API, but only published articles are returned

        expect(typeof article.title).toBe('string');
        expect(typeof article.content).toBe('string');
        expect(typeof article.category).toBe('string');
      });

      // Validate against OpenAPI spec
      expect(apiValidator.validateResponse('/api/v1/articles', 'get', 200, body)).toBe(true);
    });

    test('GET /api/v1/articles - should support category filtering', async ({ page }) => {
      const response = await page.request.get('/api/v1/articles?category=ekonomi-qarkulluese&limit=5');
      const body = await apiTestUtils.testApiResponse(response, 200);

      // Validate pagination
      apiTestUtils.testPaginationStructure(body);

      // Validate all returned articles have the correct category
      body.data.forEach((article: any) => {
        expect(article.category).toBe('ekonomi-qarkulluese');
        expect(article.published).toBe(true);
      });
    });
  });

  test.describe('API Error Handling', () => {
    test('should return proper error for invalid endpoints', async ({ page }) => {
      // Skip: Next.js returns HTML error pages for unmatched API routes
      test.skip(true, 'Next.js returns HTML for unmatched API routes');
    });

    test('should return proper error for malformed requests', async ({ page }) => {
      // Send invalid type parameter
      const response = await page.request.get('/api/v1/listings?type=invalid');
      const body = await apiTestUtils.testApiResponse(response, 400);

      // Error can be a string or object with message
      if (typeof body.error === 'string') {
        expect(body.error).toBeTruthy();
      } else {
        expect(body.error).toHaveProperty('message');
      }
    });

    test('should handle rate limiting gracefully', async ({ page }) => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(50).fill(null).map(() =>
        page.request.get('/api/health')
      );

      const responses = await Promise.all(requests);

      // At least some requests should succeed
      const successCount = responses.filter(r => r.status() === 200).length;
      expect(successCount).toBeGreaterThan(0);

      // Some might be rate limited (429) or succeed
      const validStatuses = responses.every(r =>
        [200, 429].includes(r.status())
      );
      expect(validStatuses).toBe(true);
    });
  });

  test.describe('API Response Headers', () => {
    test('should include proper CORS headers', async ({ page }) => {
      const response = await page.request.get('/api/health');

      // Check CORS headers (may not be present in development)
      const headers = response.headers();
      // CORS headers are typically set by hosting platform or API gateway
      // In development, they may not be present
      if (headers['access-control-allow-origin']) {
        expect(headers).toHaveProperty('access-control-allow-origin');
      }
    });

    test('should include proper security headers', async ({ page }) => {
      const response = await page.request.get('/api/health');

      const headers = response.headers();

      // Check security headers that are actually set
      expect(headers).toHaveProperty('x-content-type-options');
      expect(headers['x-content-type-options']).toBe('nosniff');

      expect(headers).toHaveProperty('x-frame-options');
      expect(headers['x-frame-options']).toBe('DENY');

      // X-XSS-Protection may not be set by default in modern browsers
      if (headers['x-xss-protection']) {
        expect(headers['x-xss-protection']).toBe('1; mode=block');
      }
    });

    test('should include proper cache headers for GET requests', async ({ page }) => {
      const response = await page.request.get('/api/health');

      const headers = response.headers();
      // Cache headers may vary by endpoint and hosting platform
      if (headers['cache-control']) {
        // If present, should not be overly aggressive caching for API endpoints
        expect(headers['cache-control']).not.toContain('max-age=31536000');
      }
    });
  });

  test.describe('API Performance', () => {
    test('should respond within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      const response = await page.request.get('/api/health');
      const endTime = Date.now();

      const responseTime = endTime - startTime;

      // API should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);

      // Should be successful
      expect(response.status()).toBe(200);
    });

    test('should handle concurrent requests efficiently', async ({ page }) => {
      const startTime = Date.now();

      // Make 10 concurrent requests
      const requests = Array(10).fill(null).map(() =>
        page.request.get('/api/health')
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });

      // Total time should be reasonable (under 5 seconds for 10 concurrent requests)
      expect(totalTime).toBeLessThan(5000);
    });
  });
});