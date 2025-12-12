import React, { useState } from 'react';
import { AlertCircle, Calendar, Users, Ticket, Check, ArrowRight, ArrowLeft, ShoppingCart, Coffee, Popcorn } from 'lucide-react';

const BookingSystem = () => {
  const [step, setStep] = useState(1); // 1: Seats, 2: Details, 3: Confirmation
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [foodItems, setFoodItems] = useState({});
  const [error, setError] = useState('');

  // Demo data
  const show = {
    name: 'Amazing Concert 2024',
    start_time: '2024-12-31T19:00:00Z',
    total_seats: 50,
    available_seats: 35,
    ticket_price: 500,
  };

  const allocatedSeats = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  const foodMenu = [
    { id: 'popcorn_small', name: 'Popcorn (Small)', price: 100, category: 'snacks', icon: '🍿' },
    { id: 'popcorn_large', name: 'Popcorn (Large)', price: 180, category: 'snacks', icon: '🍿' },
    { id: 'nachos', name: 'Nachos with Cheese', price: 150, category: 'snacks', icon: '🧀' },
    { id: 'hotdog', name: 'Hot Dog', price: 120, category: 'snacks', icon: '🌭' },
    { id: 'coke', name: 'Coca Cola', price: 80, category: 'drinks', icon: '🥤' },
    { id: 'pepsi', name: 'Pepsi', price: 80, category: 'drinks', icon: '🥤' },
    { id: 'sprite', name: 'Sprite', price: 80, category: 'drinks', icon: '🥤' },
    { id: 'water', name: 'Mineral Water', price: 40, category: 'drinks', icon: '💧' },
    { id: 'coffee', name: 'Coffee', price: 100, category: 'drinks', icon: '☕' },
  ];

  // STEP 1: Seat Selection Functions
  const handleSeatClick = (seatNumber) => {
    if (allocatedSeats.includes(seatNumber)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const getSeatStatus = (seatNumber) => {
    if (allocatedSeats.includes(seatNumber)) return 'booked';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'booked': return 'bg-red-500 cursor-not-allowed text-white';
      case 'selected': return 'bg-blue-500 hover:bg-blue-600 cursor-pointer text-white';
      case 'available': return 'bg-white hover:bg-gray-100 cursor-pointer border-2 border-gray-300 text-gray-700';
      default: return 'bg-white';
    }
  };

  // STEP 2: User Details & Food Functions
  const handleFoodChange = (itemId, quantity) => {
    setFoodItems(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity)
    }));
  };

  const calculateTotal = () => {
    const ticketTotal = selectedSeats.length * show.ticket_price;
    const foodTotal = Object.entries(foodItems).reduce((sum, [itemId, quantity]) => {
      const item = foodMenu.find(i => i.id === itemId);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
    return { ticketTotal, foodTotal, grandTotal: ticketTotal + foodTotal };
  };

  // Navigation Functions
  const goToDetails = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }
    setError('');
    setStep(2);
  };

  const goToConfirmation = () => {
    if (!userDetails.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!userDetails.email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!userDetails.phone.trim() || userDetails.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setStep(3);
  };

  const confirmBooking = () => {
    alert('🎉 Booking Confirmed! In real app, this would call the API.');
    // Reset for demo
    setTimeout(() => {
      setStep(1);
      setSelectedSeats([]);
      setUserDetails({ name: '', email: '', phone: '' });
      setFoodItems({});
    }, 2000);
  };

  // Render Step 1: Seat Selection
  const renderSeatSelection = () => {
    const seatsPerRow = 10;
    const rows = Math.ceil(show.total_seats / seatsPerRow);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Seats</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Booked</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-gray-800 text-white text-center py-2 rounded-t-lg">SCREEN</div>
          </div>

          <div className="flex flex-col items-center gap-3 mb-6">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                  const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                  if (seatNumber > show.total_seats) return null;

                  const status = getSeatStatus(seatNumber);
                  return (
                    <button
                      key={seatNumber}
                      type="button"
                      onClick={() => handleSeatClick(seatNumber)}
                      disabled={status === 'booked'}
                      className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors ${getSeatColor(status)}`}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {selectedSeats.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Selected: {selectedSeats.sort((a, b) => a - b).join(', ')}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {selectedSeats.length} × ₹{show.ticket_price} = ₹{selectedSeats.length * show.ticket_price}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={goToDetails}
          disabled={selectedSeats.length === 0}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
        >
          Continue to Details <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Render Step 2: User Details & Food
  const renderDetailsAndFood = () => {
    const snacks = foodMenu.filter(item => item.category === 'snacks');
    const drinks = foodMenu.filter(item => item.category === 'drinks');
    const { ticketTotal, foodTotal, grandTotal } = calculateTotal();

    return (
      <div className="space-y-6">
        {/* User Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={userDetails.name}
                onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                value={userDetails.email}
                onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={userDetails.phone}
                onChange={(e) => setUserDetails({...userDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Food & Drinks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Popcorn className="w-6 h-6" /> Food & Beverages
          </h2>
          
          <div className="space-y-6">
            {/* Snacks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🍿 Snacks</h3>
              <div className="space-y-3">
                {snacks.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleFoodChange(item.id, (foodItems[item.id] || 0) - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{foodItems[item.id] || 0}</span>
                      <button
                        onClick={() => handleFoodChange(item.id, (foodItems[item.id] || 0) + 1)}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drinks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🥤 Beverages</h3>
              <div className="space-y-3">
                {drinks.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleFoodChange(item.id, (foodItems[item.id] || 0) - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{foodItems[item.id] || 0}</span>
                      <button
                        onClick={() => handleFoodChange(item.id, (foodItems[item.id] || 0) + 1)}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tickets ({selectedSeats.length})</span>
              <span className="font-medium">₹{ticketTotal}</span>
            </div>
            {foodTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span>Food & Beverages</span>
                <span className="font-medium">₹{foodTotal}</span>
              </div>
            )}
            <div className="pt-2 border-t border-blue-300 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <button
            onClick={goToConfirmation}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            Review Booking <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Render Step 3: Confirmation
  const renderConfirmation = () => {
    const { ticketTotal, foodTotal, grandTotal } = calculateTotal();
    const foodOrders = Object.entries(foodItems)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        ...foodMenu.find(i => i.id === itemId),
        quantity: qty
      }));

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Booking</h2>
            <p className="text-gray-600">Please review before confirming</p>
          </div>

          {/* Show Details */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Show Details</h3>
            <p className="text-lg font-medium">{show.name}</p>
            <p className="text-sm text-gray-600">{new Date(show.start_time).toLocaleString()}</p>
          </div>

          {/* User Details */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Your Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {userDetails.name}</p>
              <p><span className="font-medium">Email:</span> {userDetails.email}</p>
              <p><span className="font-medium">Phone:</span> {userDetails.phone}</p>
            </div>
          </div>

          {/* Seats */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Seats</h3>
            <p className="text-sm">Seats: {selectedSeats.sort((a, b) => a - b).join(', ')}</p>
            <p className="text-sm text-gray-600 mt-1">{selectedSeats.length} × ₹{show.ticket_price} = ₹{ticketTotal}</p>
          </div>

          {/* Food Orders */}
          {foodOrders.length > 0 && (
            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Food & Beverages</h3>
              <div className="space-y-2">
                {foodOrders.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.icon} {item.name} × {item.quantity}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Grand Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Edit Details
          </button>
          <button
            onClick={confirmBooking}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <Check className="w-5 h-5" /> Confirm & Pay
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎫 {show.name}</h1>
          <p className="text-gray-600">{new Date(show.start_time).toLocaleString()}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Select Seats' },
              { num: 2, label: 'Your Details' },
              { num: 3, label: 'Confirm' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s.num ? <Check className="w-6 h-6" /> : s.num}
                  </div>
                  <span className={`text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && <div className={`w-12 h-1 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        {step === 1 && renderSeatSelection()}
        {step === 2 && renderDetailsAndFood()}
        {step === 3 && renderConfirmation()}
      </div>
    </div>
  );
};

export default BookingSystem;