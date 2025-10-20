# API Documentation

## Overview

The AI Product Recommendation Dashboard API provides endpoints for generating intelligent product recommendations using OpenAI's GPT-4o-mini model. The API is designed with comprehensive error handling, automatic fallbacks, and production-ready features.

## Base URLs

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.vercel.app/api`

## Authentication

The API uses OpenAI API key for AI-powered recommendations. If no API key is provided, the system automatically falls back to mock recommendations.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for AI recommendations. If not provided, uses mock data |

## Endpoints

### POST /api/recommendations

Generate AI-powered product recommendations based on a selected product.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "productName": "MacBook Air"
}
```

**Parameters:**

| Parameter | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| `productName` | string | Yes | Name of the product to get recommendations for | 1-200 characters, non-empty |

#### Response

**Success Response (200 OK):**
```json
{
  "recommendations": [
    {
      "name": "MacBook Pro",
      "reason": "More powerful processor and better graphics for demanding tasks"
    },
    {
      "name": "iPad Pro",
      "reason": "Portable alternative with touch interface and Apple Pencil support"
    },
    {
      "name": "Magic Mouse",
      "reason": "Perfect wireless mouse companion for your MacBook setup"
    },
    {
      "name": "USB-C Hub",
      "reason": "Expand connectivity with multiple ports for peripherals"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Bad request",
  "message": "productName is required in request body"
}
```

**405 Method Not Allowed:**
```json
{
  "error": "Method not allowed",
  "message": "Only POST requests are supported for this endpoint"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Failed to generate recommendations"
}
```

**503 Service Unavailable:**
```json
{
  "error": "Service unavailable",
  "message": "External service is temporarily unavailable"
}
```

**504 Gateway Timeout:**
```json
{
  "error": "Gateway timeout",
  "message": "Request timed out. Please try again."
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Recommendations generated successfully |
| 400 | Bad Request - Invalid input parameters |
| 405 | Method Not Allowed - Only POST requests accepted |
| 500 | Internal Server Error - Server-side error occurred |
| 503 | Service Unavailable - External service (OpenAI) unavailable |
| 504 | Gateway Timeout - Request exceeded timeout limit |

### GET /api/health

Health check endpoint to verify API availability and status.

#### Request

No parameters required.

#### Response

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "message": "API server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

The API implements a comprehensive error handling strategy with multiple fallback layers:

### 1. Input Validation

All requests are validated for:
- Required parameters presence
- Data type validation
- String length constraints
- Content sanitization

### 2. OpenAI API Integration

**Automatic Fallbacks:**
- Missing API key → Mock recommendations
- Network errors → Mock recommendations
- Rate limiting → Mock recommendations
- Invalid responses → Mock recommendations

**Error Categories:**
- **Authentication Errors**: Invalid or missing API key
- **Network Errors**: Connection failures, timeouts
- **Rate Limiting**: API quota exceeded
- **Server Errors**: OpenAI service unavailable

### 3. Response Validation

All API responses are validated for:
- Valid JSON structure
- Required fields presence
- Data type consistency
- Content quality checks

### 4. Timeout Protection

- **API Requests**: 30-second timeout limit
- **OpenAI Calls**: 10-second timeout with fallback
- **Request Processing**: Automatic cleanup on timeout

## Mock Recommendations

When OpenAI API is unavailable, the system provides intelligent mock recommendations based on product categories:

### Supported Products

| Product | Mock Recommendations |
|---------|---------------------|
| MacBook Air | MacBook Pro, iPad Pro, Magic Mouse, USB-C Hub |
| Dell XPS 13 | Dell XPS 15, Dell Wireless Mouse, Dell Monitor, Laptop Stand |
| ThinkPad X1 Carbon | ThinkPad Docking Station, Lenovo Wireless Keyboard, ThinkPad Travel Mouse, Laptop Bag |
| Generic Products | Laptop Stand, Wireless Mouse, External Monitor, USB-C Charger |

## Rate Limiting

The API respects OpenAI's rate limiting policies:

- **Automatic Retry**: Failed requests are retried with exponential backoff
- **Graceful Degradation**: Rate-limited requests fall back to mock data
- **User Experience**: No user-facing errors due to rate limiting

## CORS Configuration

The API includes comprehensive CORS support:

```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Using fetch API
async function getRecommendations(productName: string) {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    throw error;
  }
}

// Usage
const recommendations = await getRecommendations('MacBook Air');
console.log(recommendations);
```

### cURL

```bash
# Get recommendations
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"productName": "MacBook Air"}'

# Health check
curl http://localhost:3001/api/health
```

### Python

```python
import requests
import json

def get_recommendations(product_name):
    url = "http://localhost:3001/api/recommendations"
    payload = {"productName": product_name}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()["recommendations"]
    except requests.exceptions.RequestException as e:
        print(f"Error fetching recommendations: {e}")
        return None

# Usage
recommendations = get_recommendations("MacBook Air")
if recommendations:
    for rec in recommendations:
        print(f"{rec['name']}: {rec['reason']}")
```

## Performance Considerations

### Response Times

- **With OpenAI API**: 1-3 seconds typical response time
- **Mock Fallback**: < 100ms response time
- **Timeout Protection**: 30-second maximum request time

### Caching

The API implements intelligent caching strategies:

- **Client-Side**: RTK Query provides automatic caching
- **Server-Side**: Responses are optimized for caching
- **CDN**: Static assets cached at edge locations

### Optimization

- **Request Validation**: Early validation prevents unnecessary processing
- **Fallback Logic**: Fast fallback to mock data on failures
- **Resource Management**: Automatic cleanup and timeout handling

## Security

### Input Sanitization

All inputs are sanitized to prevent:
- SQL injection attacks
- XSS vulnerabilities
- Command injection
- Path traversal attacks

### API Key Security

- API keys are stored as environment variables
- No API keys exposed in client-side code
- Automatic fallback prevents key exposure errors

### Error Information

- Error messages are user-friendly and don't expose internal details
- Detailed error information is logged server-side only
- Stack traces are not exposed in production

## Monitoring and Logging

### Request Logging

All API requests are logged with:
- Timestamp
- Request parameters
- Response status
- Processing time
- Error details (if any)

### Error Tracking

Comprehensive error tracking includes:
- Error categorization
- Fallback activation
- Performance metrics
- User impact assessment

### Health Monitoring

The `/api/health` endpoint provides:
- Service availability status
- Dependency health checks
- Performance metrics
- System resource usage

## Development and Testing

### Local Development

```bash
# Start development API server
npm run dev-server

# Test health endpoint
curl http://localhost:3001/api/health

# Test recommendations endpoint
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"productName": "MacBook Air"}'
```

### Testing Strategies

1. **Unit Tests**: Test individual API functions
2. **Integration Tests**: Test full request/response cycle
3. **Error Scenario Tests**: Test all error conditions
4. **Performance Tests**: Test response times and timeouts
5. **Security Tests**: Test input validation and sanitization

### Mock Testing

To test with mock data only (disable OpenAI):

```bash
# Remove or comment out OPENAI_API_KEY
unset OPENAI_API_KEY
npm run dev-server
```

## Troubleshooting

### Common Issues

**Issue**: `CORS errors in browser`
- **Solution**: Ensure API server is running and CORS headers are set
- **Check**: Browser network tab for preflight requests

**Issue**: `Timeout errors`
- **Solution**: Check network connectivity and OpenAI service status
- **Fallback**: System should automatically use mock data

**Issue**: `Invalid JSON responses`
- **Solution**: Check OpenAI API key validity and account status
- **Fallback**: System should automatically use mock data

**Issue**: `Rate limiting errors`
- **Solution**: Implement request throttling or upgrade OpenAI plan
- **Fallback**: System should automatically use mock data

### Debug Mode

Enable detailed logging:

```bash
DEBUG=true npm run dev-server
```

This provides:
- Detailed request/response logging
- Error stack traces
- Performance timing information
- Fallback activation details

## API Versioning

Current API version: `v1`

Future versions will maintain backward compatibility:
- New endpoints will be added with version prefixes
- Existing endpoints will remain stable
- Deprecation notices will be provided in advance
- Migration guides will be available for breaking changes

## Support

For API-related issues:

1. Check this documentation
2. Review error logs and console output
3. Test with mock data (remove OpenAI API key)
4. Verify network connectivity and CORS settings
5. Check OpenAI service status and API key validity

For additional support, refer to the main [README.md](./README.md) troubleshooting section.