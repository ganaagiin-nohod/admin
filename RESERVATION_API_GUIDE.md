# Multi-Source Reservation System API Guide

This guide explains how to integrate reservations from different websites and platforms into your central reservation management system.

## Overview

The reservation system is designed to accept bookings from multiple sources:
- Your main website
- Third-party booking platforms (OpenTable, Resy, etc.)
- Partner websites
- Mobile apps
- Direct API integrations

## API Endpoints

### Base URL
```
https://yourdomain.com/api/reservations
```

### Authentication
All external API calls require an API key in the header:
```
Authorization: Bearer YOUR_API_KEY
X-Source: source_identifier
```

## Core API Endpoints

### 1. Create Reservation (POST /api/reservations)

**Endpoint:** `POST /api/reservations`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY",
  "X-Source": "website|opentable|resy|partner_site"
}
```

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "date": "2024-02-15",
  "time": "19:00",
  "partySize": 4,
  "specialRequests": "Birthday celebration",
  "source": "opentable",
  "externalId": "OT_12345",
  "metadata": {
    "platform": "OpenTable",
    "referenceNumber": "OT_12345",
    "commission": 2.50
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "reservation_id",
    "customerName": "John Doe",
    "status": "pending",
    "source": "opentable",
    "createdAt": "2024-02-01T10:00:00Z"
  }
}
```

### 2. Get Reservations (GET /api/reservations)

**Query Parameters:**
- `source`: Filter by source (website, opentable, resy, etc.)
- `status`: Filter by status (pending, confirmed, cancelled, completed)
- `date`: Filter by specific date (YYYY-MM-DD)
- `dateRange`: Filter by date range (start_date,end_date)

**Example:**
```
GET /api/reservations?source=opentable&status=confirmed&date=2024-02-15
```

### 3. Update Reservation (PUT /api/reservations/:id)

**Use Cases:**
- Update status from external platform
- Sync changes from third-party systems
- Handle cancellations

### 4. Webhook Endpoint (POST /api/webhooks/reservations)

For real-time updates from external platforms:

```json
{
  "event": "reservation.created|reservation.updated|reservation.cancelled",
  "source": "opentable",
  "data": {
    "externalId": "OT_12345",
    "status": "confirmed",
    "updatedAt": "2024-02-01T10:00:00Z"
  }
}
```

## Integration Examples

### 1. OpenTable Integration

```javascript
// Webhook handler for OpenTable
const handleOpenTableWebhook = async (req, res) => {
  const { event, reservation } = req.body;
  
  const reservationData = {
    customerName: reservation.customer.name,
    customerEmail: reservation.customer.email,
    customerPhone: reservation.customer.phone,
    date: reservation.date,
    time: reservation.time,
    partySize: reservation.party_size,
    source: 'opentable',
    externalId: reservation.id,
    metadata: {
      platform: 'OpenTable',
      referenceNumber: reservation.confirmation_number,
      commission: reservation.commission
    }
  };

  // Create or update reservation
  await createReservation(reservationData);
};
```

### 2. Partner Website Integration

```javascript
// JavaScript widget for partner websites
class ReservationWidget {
  constructor(apiKey, restaurantId) {
    this.apiKey = apiKey;
    this.restaurantId = restaurantId;
    this.baseUrl = 'https://yourdomain.com/api';
  }

  async createReservation(data) {
    const response = await fetch(`${this.baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Source': 'partner_website'
      },
      body: JSON.stringify({
        ...data,
        source: 'partner_website',
        metadata: {
          restaurantId: this.restaurantId,
          partnerSite: window.location.hostname
        }
      })
    });

    return response.json();
  }
}

// Usage
const widget = new ReservationWidget('your_api_key', 'restaurant_123');
```

### 3. Mobile App Integration

```swift
// iOS Swift example
struct ReservationAPI {
    let baseURL = "https://yourdomain.com/api"
    let apiKey = "your_api_key"
    
    func createReservation(data: ReservationData) async throws -> ReservationResponse {
        var request = URLRequest(url: URL(string: "\(baseURL)/reservations")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("mobile_app", forHTTPHeaderField: "X-Source")
        
        let jsonData = try JSONEncoder().encode(data)
        request.httpBody = jsonData
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(ReservationResponse.self, from: data)
    }
}
```

## Source Tracking

Each reservation tracks its source for analytics and management:

```json
{
  "source": "opentable",
  "metadata": {
    "platform": "OpenTable",
    "referenceNumber": "OT_12345",
    "commission": 2.50,
    "partnerFee": 1.00,
    "originalUrl": "https://partner-site.com/booking"
  }
}
```

## Real-time Synchronization

### Webhook Configuration

Set up webhooks for each platform:

1. **OpenTable**: Configure webhook URL in OpenTable dashboard
2. **Resy**: Set up API webhook endpoint
3. **Partner Sites**: Provide webhook URL for status updates

### Conflict Resolution

When the same reservation comes from multiple sources:

```javascript
const handleConflict = (existingReservation, newReservation) => {
  // Priority order: direct > opentable > resy > partner
  const sourcePriority = {
    'direct': 1,
    'opentable': 2,
    'resy': 3,
    'partner': 4
  };
  
  if (sourcePriority[newReservation.source] < sourcePriority[existingReservation.source]) {
    // Update with higher priority source
    return updateReservation(existingReservation.id, newReservation);
  }
};
```

## Analytics & Reporting

Track reservation sources for business insights:

```sql
-- Revenue by source
SELECT 
  source,
  COUNT(*) as total_reservations,
  AVG(party_size) as avg_party_size,
  SUM(estimated_revenue) as total_revenue
FROM reservations 
WHERE date >= '2024-01-01'
GROUP BY source;
```

## Security Considerations

1. **API Key Management**: Rotate keys regularly
2. **Rate Limiting**: Implement per-source rate limits
3. **Webhook Verification**: Verify webhook signatures
4. **Data Validation**: Sanitize all incoming data

## Testing

### Test Endpoints

```bash
# Test reservation creation
curl -X POST https://yourdomain.com/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_api_key" \
  -H "X-Source: test" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "+1234567890",
    "date": "2024-02-15",
    "time": "19:00",
    "partySize": 2,
    "source": "test"
  }'
```

## Error Handling

Common error responses:

```json
{
  "success": false,
  "error": "Time slot already booked",
  "code": "SLOT_UNAVAILABLE",
  "details": {
    "conflictingReservation": "reservation_id",
    "suggestedTimes": ["18:30", "19:30", "20:00"]
  }
}
```

## Getting Started

1. Generate API keys for each integration source
2. Set up webhook endpoints
3. Configure source-specific settings
4. Test with sandbox/staging environments
5. Deploy to production with monitoring

This system allows you to centrally manage reservations from any source while maintaining data integrity and providing real-time synchronization across all platforms.