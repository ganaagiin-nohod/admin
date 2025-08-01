/**
 * Reservation Widget for External Websites
 *
 * Usage:
 * <script src="https://yourdomain.com/reservation-widget.js"></script>
 * <script>
 *   ReservationWidget.init({
 *     apiKey: 'your_api_key',
 *     containerId: 'reservation-form',
 *     restaurantId: 'restaurant_123'
 *   });
 * </script>
 */

(function () {
  'use strict';

  const ReservationWidget = {
    config: {
      apiUrl: 'https://yourdomain.com/api/reservations',
      apiKey: null,
      containerId: null,
      restaurantId: null
    },

    init: function (options) {
      this.config = { ...this.config, ...options };
      this.render();
      this.bindEvents();
    },

    render: function () {
      const container = document.getElementById(this.config.containerId);
      if (!container) {
        console.error('Reservation widget container not found');
        return;
      }

      container.innerHTML = `
        <div class="reservation-widget">
          <h3>Make a Reservation</h3>
          <form id="reservation-form">
            <div class="form-group">
              <label for="customerName">Name *</label>
              <input type="text" id="customerName" name="customerName" required>
            </div>
            
            <div class="form-group">
              <label for="customerEmail">Email *</label>
              <input type="email" id="customerEmail" name="customerEmail" required>
            </div>
            
            <div class="form-group">
              <label for="customerPhone">Phone *</label>
              <input type="tel" id="customerPhone" name="customerPhone" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="date">Date *</label>
                <input type="date" id="date" name="date" required min="${new Date().toISOString().split('T')[0]}">
              </div>
              
              <div class="form-group">
                <label for="time">Time *</label>
                <select id="time" name="time" required>
                  <option value="">Select time</option>
                  ${this.generateTimeOptions()}
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="partySize">Party Size *</label>
              <select id="partySize" name="partySize" required>
                <option value="">Select size</option>
                ${Array.from({ length: 20 }, (_, i) => i + 1)
                  .map(
                    (size) =>
                      `<option value="${size}">${size} ${size === 1 ? 'person' : 'people'}</option>`
                  )
                  .join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label for="specialRequests">Special Requests</label>
              <textarea id="specialRequests" name="specialRequests" rows="3"></textarea>
            </div>
            
            <button type="submit" id="submit-btn">Make Reservation</button>
            <div id="message" class="message"></div>
          </form>
        </div>
        
        <style>
          .reservation-widget {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-family: Arial, sans-serif;
          }
          
          .form-group {
            margin-bottom: 15px;
          }
          
          .form-row {
            display: flex;
            gap: 15px;
          }
          
          .form-row .form-group {
            flex: 1;
          }
          
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          
          input, select, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
          }
          
          button {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
          }
          
          button:hover {
            background-color: #0056b3;
          }
          
          button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
          
          .message {
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            display: none;
          }
          
          .message.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
        </style>
      `;
    },

    generateTimeOptions: function () {
      const options = [];
      for (let hour = 10; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          options.push(`<option value="${time}">${time}</option>`);
        }
      }
      return options.join('');
    },

    bindEvents: function () {
      const form = document.getElementById('reservation-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitReservation(form);
      });
    },

    submitReservation: async function (form) {
      const submitBtn = document.getElementById('submit-btn');
      const messageDiv = document.getElementById('message');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Reservation...';

      const formData = new FormData(form);
      const data = {
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone'),
        date: formData.get('date'),
        time: formData.get('time'),
        partySize: parseInt(formData.get('partySize')),
        specialRequests: formData.get('specialRequests'),
        source: 'partner',
        metadata: {
          platform: 'Partner Website',
          partnerId: this.config.restaurantId,
          originalUrl: window.location.href,
          referrer: document.referrer
        }
      };

      try {
        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
            'X-Source': 'partner'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          this.showMessage(
            'Reservation created successfully! We will contact you to confirm.',
            'success'
          );
          form.reset();
        } else {
          this.showMessage(
            result.error || 'Failed to create reservation. Please try again.',
            'error'
          );
        }
      } catch (error) {
        console.error('Reservation error:', error);
        this.showMessage(
          'Failed to create reservation. Please try again.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Make Reservation';
      }
    },

    showMessage: function (text, type) {
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = text;
      messageDiv.className = `message ${type}`;
      messageDiv.style.display = 'block';

      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  };

  // Make it globally available
  window.ReservationWidget = ReservationWidget;
})();
