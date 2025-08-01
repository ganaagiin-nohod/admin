# Reservation System Integration Examples

This document provides practical examples for integrating with various reservation platforms and external websites.

## 1. OpenTable Integration

### Webhook Setup
Configure your OpenTable webhook URL to: `https://yourdomain.com/api/webhooks/reservations`

### Sample OpenTable Webhook Payload
```json
{
  "event": "reservation.created",
  "restaurant_id": "12345",
  "reservation": {
    "id": "OT_789123",
    "confirmation_number": "ABC123",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "date": "2024-02-15",
    "time": "19:00",
    "party_size": 4,
    "status": "confirmed",
    "special_requests": "Birthday celebration",
    "commission": 2.50,
    "table_preference": "window"
  }
}
```

### Processing Script
```javascript
// webhook-handler.js
const processOpenTableWebhook = async (payload) => {
  const response = await fetch('https://yourdomain.com/api/webhooks/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source': 'opentable',
      'X-Webhook-Signature': generateSignature(payload)
    },
    body: JSON.stringify(payload)
  });
  
  return response.json();
};
```

## 2. Resy Integration

### API Configuration
```javascript
const resyConfig = {
  apiKey: process.env.RESY_API_KEY,
  webhookUrl: 'https://yourdomain.com/api/webhooks/reservations',
  restaurantId: 'resy_restaurant_456'
};

// Resy webhook payload format
const resyWebhookPayload = {
  "event": "reservation.booked",
  "data": {
    "resy_id": "RESY_456789",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1987654321",
    "reservation_date": "2024-02-16",
    "reservation_time": "20:00",
    "guests": 2,
    "status": "booked",
    "notes": "Vegetarian options needed",
    "commission": 3.00
  }
};
```

## 3. Partner Website Integration

### HTML Implementation
```html
<!DOCTYPE html>
<html>
<head>
    <title>Restaurant Reservations</title>
</head>
<body>
    <div id="reservation-form"></div>
    
    <script src="https://yourdomain.com/reservation-widget.js"></script>
    <script>
        ReservationWidget.init({
            apiKey: 'partner_api_key_here',
            containerId: 'reservation-form',
            restaurantId: 'restaurant_123'
        });
    </script>
</body>
</html>
```

### Custom Integration
```javascript
class CustomReservationIntegration {
  constructor(apiKey, restaurantId) {
    this.apiKey = apiKey;
    this.restaurantId = restaurantId;
    this.apiUrl = 'https://yourdomain.com/api/reservations';
  }

  async createReservation(reservationData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Source': 'partner'
        },
        body: JSON.stringify({
          ...reservationData,
          source: 'partner',
          metadata: {
            platform: 'Custom Integration',
            partnerId: this.restaurantId,
            integrationVersion: '1.0.0'
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Reservation created:', result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Reservation creation failed:', error);
      throw error;
    }
  }

  async getReservations(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.apiUrl}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Source': 'partner'
      }
    });

    return response.json();
  }
}

// Usage
const integration = new CustomReservationIntegration('your_api_key', 'restaurant_123');

// Create a reservation
integration.createReservation({
  customerName: 'Alice Johnson',
  customerEmail: 'alice@example.com',
  customerPhone: '+1555123456',
  date: '2024-02-20',
  time: '18:30',
  partySize: 3,
  specialRequests: 'Gluten-free options'
});
```

## 4. Mobile App Integration

### React Native Example
```javascript
// ReservationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class ReservationService {
  constructor() {
    this.baseUrl = 'https://yourdomain.com/api';
    this.apiKey = 'mobile_app_api_key';
  }

  async createReservation(reservationData) {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      const response = await fetch(`${this.baseUrl}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Source': 'mobile_app'
        },
        body: JSON.stringify({
          ...reservationData,
          source: 'mobile_app',
          metadata: {
            platform: 'Mobile App',
            deviceId: deviceId,
            appVersion: '1.2.0',
            os: Platform.OS
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Mobile reservation error:', error);
      throw error;
    }
  }
}

// Usage in React Native component
const ReservationScreen = () => {
  const reservationService = new ReservationService();

  const handleSubmit = async (formData) => {
    try {
      const result = await reservationService.createReservation(formData);
      if (result.success) {
        Alert.alert('Success', 'Reservation created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create reservation');
    }
  };

  return (
    // Your React Native form components here
  );
};
```

### iOS Swift Example
```swift
import Foundation

class ReservationAPI {
    private let baseURL = "https://yourdomain.com/api"
    private let apiKey = "mobile_app_api_key"
    
    func createReservation(data: ReservationData) async throws -> ReservationResponse {
        guard let url = URL(string: "\(baseURL)/reservations") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("mobile_app", forHTTPHeaderField: "X-Source")
        
        let requestData = ReservationRequest(
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            date: data.date,
            time: data.time,
            partySize: data.partySize,
            specialRequests: data.specialRequests,
            source: "mobile_app",
            metadata: ReservationMetadata(
                platform: "iOS App",
                appVersion: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String,
                deviceModel: UIDevice.current.model
            )
        )
        
        request.httpBody = try JSONEncoder().encode(requestData)
        
        let (responseData, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(ReservationResponse.self, from: responseData)
    }
}
```

## 5. WordPress Plugin Integration

### PHP Implementation
```php
<?php
// wp-restaurant-reservations.php

class RestaurantReservations {
    private $api_url = 'https://yourdomain.com/api/reservations';
    private $api_key;
    
    public function __construct($api_key) {
        $this->api_key = $api_key;
        add_action('wp_ajax_create_reservation', array($this, 'handle_reservation'));
        add_action('wp_ajax_nopriv_create_reservation', array($this, 'handle_reservation'));
    }
    
    public function handle_reservation() {
        $reservation_data = array(
            'customerName' => sanitize_text_field($_POST['customer_name']),
            'customerEmail' => sanitize_email($_POST['customer_email']),
            'customerPhone' => sanitize_text_field($_POST['customer_phone']),
            'date' => sanitize_text_field($_POST['date']),
            'time' => sanitize_text_field($_POST['time']),
            'partySize' => intval($_POST['party_size']),
            'specialRequests' => sanitize_textarea_field($_POST['special_requests']),
            'source' => 'wordpress',
            'metadata' => array(
                'platform' => 'WordPress',
                'siteUrl' => get_site_url(),
                'pluginVersion' => '1.0.0'
            )
        );
        
        $response = wp_remote_post($this->api_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
                'X-Source' => 'wordpress'
            ),
            'body' => json_encode($reservation_data)
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('Failed to create reservation');
        } else {
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if ($data['success']) {
                wp_send_json_success('Reservation created successfully');
            } else {
                wp_send_json_error($data['error']);
            }
        }
    }
}

// Initialize the plugin
$reservations = new RestaurantReservations('your_wordpress_api_key');
?>
```

## 6. Testing Your Integrations

### cURL Examples
```bash
# Test reservation creation
curl -X POST https://yourdomain.com/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -H "X-Source: test" \
  -d '{
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "customerPhone": "+1234567890",
    "date": "2024-02-25",
    "time": "19:00",
    "partySize": 2,
    "source": "test",
    "metadata": {
      "platform": "Test Integration"
    }
  }'

# Test webhook
curl -X POST https://yourdomain.com/api/webhooks/reservations \
  -H "Content-Type: application/json" \
  -H "X-Source: opentable" \
  -d '{
    "event": "reservation.created",
    "data": {
      "externalId": "TEST_123",
      "customerName": "Webhook Test",
      "customerEmail": "webhook@test.com",
      "customerPhone": "+1234567890",
      "date": "2024-02-26",
      "time": "20:00",
      "partySize": 4
    }
  }'
```

### Postman Collection
Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Restaurant Reservations API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Reservation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{api_key}}"
          },
          {
            "key": "X-Source",
            "value": "postman"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"customerName\": \"John Doe\",\n  \"customerEmail\": \"john@example.com\",\n  \"customerPhone\": \"+1234567890\",\n  \"date\": \"2024-02-20\",\n  \"time\": \"19:00\",\n  \"partySize\": 4,\n  \"specialRequests\": \"Window table preferred\",\n  \"source\": \"postman\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/reservations",
          "host": ["{{base_url}}"],
          "path": ["api", "reservations"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://yourdomain.com"
    },
    {
      "key": "api_key",
      "value": "your_api_key_here"
    }
  ]
}
```

## Environment Variables

Add these to your `.env` file:

```env
# API Keys for different sources
OPENTABLE_API_KEY=your_opentable_key
RESY_API_KEY=your_resy_key
PARTNER_API_KEY=your_partner_key
MOBILE_APP_API_KEY=your_mobile_key

# Webhook security
WEBHOOK_SECRET=your_webhook_secret_key

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
```

This comprehensive integration system allows you to accept reservations from any source while maintaining centralized management and analytics.