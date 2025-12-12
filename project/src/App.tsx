import { useState, useEffect } from 'react';
import { Calendar, ShoppingCart, Trash2, X, CheckCircle, LogOut, IndianRupee, UserPlus, LogIn, Users } from 'lucide-react';

// Types
interface Show {
  id: string;
  name: string;
  date: string;
  time: string;
  totalSeats: number;
  bookedSeats: number[];
  lockedSeats: { [seatNum: number]: number }; // seatNum -> lockTimestamp
  ticketPrice: number;
  venue: string;
  description: string;
  posterUrl?: string; // Fallback image URL
  trailerUrl?: string; // Optional YouTube trailer URL
}

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends FoodItem {
  quantity: number;
}

interface Booking {
  show: Show;
  selectedSeats: number[];
  foodItems: CartItem[];
  totalAmount: number;
}

interface BookingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieName: string;
  movieDate: string;
  movieTime: string;
  seats: number[];
  foodItems: CartItem[];
  totalAmount: number;
  bookingDate: string; // When they booked it
  venue: string;
}

interface RegisteredUser {
  email: string;
  phone: string;
  password: string;
  name: string;
}

interface CancellationRequest {
  id: string;
  bookingId: string;
  customerName: string;
  movieName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  seats: number[];
}

// Initial data
const initialShows: Show[] = [
  {
    id: '1',
    name: 'Pushpa 2: The Rule',
    date: '2024-12-20',
    time: '18:00',
    totalSeats: 50,
    bookedSeats: [],
    lockedSeats: {},
    ticketPrice: 200,
    venue: 'MODEX CINEMA - Hall 1',
    description: 'The epic saga continues as Pushpa Raj rises to power in this action-packed sequel.',
    posterUrl: ''
  },
  {
    id: '2',
    name: 'Salaar',
    date: '2024-12-21',
    time: '21:00',
    totalSeats: 60,
    bookedSeats: [],
    lockedSeats: {},
    ticketPrice: 250,
    venue: 'MODEX CINEMA - Hall 2',
    description: 'An action thriller about friendship, betrayal, and redemption in the underworld.',
    posterUrl: ''
  }
];

const foodItems: FoodItem[] = [
  { id: 'f1', name: 'Popcorn', price: 150, image: '🍿' },
  { id: 'f2', name: 'Cold Drink', price: 80, image: '🥤' },
  { id: 'f3', name: 'Water Bottle', price: 20, image: '💧' },
  { id: 'f4', name: 'Samosa', price: 40, image: '🥟' },
  { id: 'f5', name: 'Pizza Slice', price: 120, image: '🍕' },
  { id: 'f6', name: 'Nachos', price: 100, image: '🌮' }
];

// Lock duration in milliseconds (10 minutes)
const SEAT_LOCK_DURATION = 10 * 60 * 1000;

// Helper: Clean up expired locked seats
const cleanupExpiredLocks = (show: Show): Show => {
  const now = Date.now();
  const updatedLockedSeats = { ...show.lockedSeats };
  
  Object.entries(updatedLockedSeats).forEach(([seatStr, lockTime]) => {
    if (now - lockTime > SEAT_LOCK_DURATION) {
      delete updatedLockedSeats[parseInt(seatStr)];
    }
  });
  
  return { ...show, lockedSeats: updatedLockedSeats };
};

const App = () => {
  const [currentView, setCurrentView] = useState<'login' | 'admin' | 'booking' | 'confirmation' | 'my-bookings'>('login');
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [foodQtySelectors, setFoodQtySelectors] = useState<{ [foodId: string]: number }>({});
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [adminFood, setAdminFood] = useState<FoodItem[]>([]);
  const [bookingRecords, setBookingRecords] = useState<BookingRecord[]>([]);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [cancellationRequests, setCancellationRequests] = useState<CancellationRequest[]>([]);
  const [adminTab, setAdminTab] = useState<'movies' | 'food' | 'bookings' | 'cancellations'>('movies');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSeats, setCancelSeats] = useState<number[]>([]);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelStage, setCancelStage] = useState<'confirm' | 'form'>('confirm');
  const [selectedUserBooking, setSelectedUserBooking] = useState<BookingRecord | null>(null);
  const [showUserCancelModal, setShowUserCancelModal] = useState(false);
  
  // Login states
  const [loginType, setLoginType] = useState<'signin' | 'login' | 'admin'>('signin');
  const [adminPassword, setAdminPassword] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Phone
  
  // Admin states
  const [newShow, setNewShow] = useState({
    name: '',
    date: '',
    time: '',
    totalSeats: 30,
    ticketPrice: 200,
    venue: '',
    description: '',
    posterUrl: ''
  });
  
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [newFoodItem, setNewFoodItem] = useState({ name: '', price: 0, image: '🍿' });
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedShows = localStorage.getItem('modexCinemaShows');
    const savedFood = localStorage.getItem('modexCinemaFood');
    const savedUserRole = localStorage.getItem('modexUserRole');
    const savedUserName = localStorage.getItem('modexUserName');
    const savedUsers = localStorage.getItem('modexRegisteredUsers');
    
    if (savedShows) {
      setShows(JSON.parse(savedShows));
    } else {
      setShows(initialShows);
      localStorage.setItem('modexCinemaShows', JSON.stringify(initialShows));
    }
    
    if (savedFood) {
      setAdminFood(JSON.parse(savedFood));
    } else {
      setAdminFood(foodItems);
    }

    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    }

    const savedBookings = localStorage.getItem('modexBookingRecords');
    if (savedBookings) {
      setBookingRecords(JSON.parse(savedBookings));
    }

    const savedCancellations = localStorage.getItem('modexCancellationRequests');
    if (savedCancellations) {
      setCancellationRequests(JSON.parse(savedCancellations));
    }

    if (savedUserRole && savedUserName) {
      setUserRole(savedUserRole as any);
      setUserName(savedUserName);
      setCurrentView(savedUserRole === 'admin' ? 'admin' : 'booking');
    }
  }, []);

  // Save shows to localStorage whenever they change
  useEffect(() => {
    if (shows.length > 0) {
      localStorage.setItem('modexCinemaShows', JSON.stringify(shows));
    }
  }, [shows]);

  // Save food to localStorage whenever it changes
  useEffect(() => {
    if (adminFood.length > 0) {
      localStorage.setItem('modexCinemaFood', JSON.stringify(adminFood));
    }
  }, [adminFood]);

  // Save booking records
  useEffect(() => {
    if (bookingRecords.length > 0) {
      localStorage.setItem('modexBookingRecords', JSON.stringify(bookingRecords));
    }
  }, [bookingRecords]);

  // Save cancellation requests
  useEffect(() => {
    if (cancellationRequests.length > 0) {
      localStorage.setItem('modexCancellationRequests', JSON.stringify(cancellationRequests));
    }
  }, [cancellationRequests]);

  // Save user session
  useEffect(() => {
    if (userRole && userName) {
      localStorage.setItem('modexUserRole', userRole);
      localStorage.setItem('modexUserName', userName);
    }
  }, [userRole, userName]);

  // Cleanup expired seat locks every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShows(prevShows => 
        prevShows.map(show => cleanupExpiredLocks(show))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Login handlers
  const handleLogin = () => {
    if (loginType === 'admin') {
      if (adminPassword === 'admin123') {
        setUserRole('admin');
        setCurrentView('admin');
        localStorage.setItem('modexUserRole', 'admin');
        setAdminPassword('');
      } else {
        alert('Wrong password! Use: admin123');
      }
    } else if (loginType === 'signin') {
      // Sign In (Register new user)
      if (!customerEmail.trim()) {
        alert('Please enter your email');
        return;
      }
      
      // Email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        alert('Please enter a valid email address');
        return;
      }
      
      if (!customerName.trim()) {
        alert('Please enter your name');
        return;
      }
      
      if (!customerPhone.trim()) {
        alert('Please enter your phone number');
        return;
      }
      
      // Phone numeric validation
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(customerPhone.replace(/\D/g, ''))) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
      
      if (!customerPassword.trim()) {
        alert('Please enter a password');
        return;
      }
      
      if (customerPassword.length < 8) {
        alert('Password must be at least 8 characters');
        return;
      }
      
      // Check if email already exists
      if (registeredUsers.some(u => u.email === customerEmail)) {
        alert('This email is already registered. Use Login instead.');
        return;
      }
      
      // Register new user
      const newUser = { email: customerEmail, phone: customerPhone, password: customerPassword, name: customerName };
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('modexRegisteredUsers', JSON.stringify(updatedUsers));
      
      // DO NOT auto-login. Instead, move to Login tab
      alert('Account created! Now please login with your email/phone and password.');
      setLoginType('login');
      
      // Clear form
      setCustomerEmail('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerPassword('');
    } else if (loginType === 'login') {
      // Login (Existing user verification)
      if (!loginIdentifier.trim()) {
        alert('Please enter your email or phone number');
        return;
      }
      if (!customerPassword.trim()) {
        alert('Please enter your password');
        return;
      }
      
      // Find user by email or phone
      const user = registeredUsers.find(u => 
        u.email === loginIdentifier || u.phone === loginIdentifier.replace(/\D/g, '')
      );
      
      if (!user || user.password !== customerPassword) {
        alert('Invalid email/phone or password');
        return;
      }
      
      // Log them in
      setUserRole('user');
      setUserName(user.name);
      setUserEmail(user.email);
      setUserPhone(user.phone);
      setCurrentView('booking');
      localStorage.setItem('modexUserRole', 'user');
      localStorage.setItem('modexUserName', user.name);
      
      // Clear form
      setCustomerEmail('');
      setCustomerPassword('');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentView('login');
    setAdminPassword('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPassword('');
    setUserName('');
    setSelectedShow(null);
    setSelectedSeats([]);
    setCart([]);
    localStorage.removeItem('modexUserRole');
    localStorage.removeItem('modexUserName');
  };

  // Calculate total amount
  const calculateTotal = () => {
    const seatsTotal = selectedSeats.length * (selectedShow?.ticketPrice || 0);
    const foodTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return seatsTotal + foodTotal;
  };

  // Get available seats count (accounting for locked seats)
  const getAvailableSeats = (show: Show) => {
    const cleanShow = cleanupExpiredLocks(show);
    const lockedCount = Object.keys(cleanShow.lockedSeats).length;
    return cleanShow.totalSeats - cleanShow.bookedSeats.length - lockedCount;
  };

  // Seat selection handler with locking
  const toggleSeat = (seatNumber: number) => {
    if (!selectedShow) return;
    
    if (selectedSeats.includes(seatNumber)) {
      // Unlock the seat if deselected
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      const updatedShow = { ...selectedShow };
      delete updatedShow.lockedSeats[seatNumber];
      setSelectedShow(updatedShow);
    } else {
      // Lock the seat when selected
      setSelectedSeats([...selectedSeats, seatNumber]);
      const updatedShow = { ...selectedShow };
      updatedShow.lockedSeats[seatNumber] = Date.now();
      setSelectedShow(updatedShow);
    }
  };

  // Food cart handlers
  const addToCart = (food: FoodItem, qty?: number) => {
    const quantity = qty || 1;
    const existing = cart.find(item => item.id === food.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === food.id 
          ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
          : item
      ));
    } else {
      setCart([...cart, { ...food, quantity: Math.min(quantity, 10) }]);
    }
  };

  const updateQuantity = (foodId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === foodId) {
        const newQuantity = Math.max(0, Math.min(item.quantity + change, 10));
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (foodId: string) => {
    setCart(cart.filter(item => item.id !== foodId));
  };

  // Admin: Add/Edit show
  const handleSaveShow = () => {
    if (!newShow.name || !newShow.date || !newShow.time || !newShow.venue || !newShow.description) {
      alert('Please fill all required fields');
      return;
    }
    
    if (editingShow) {
      setShows(shows.map(show => 
        show.id === editingShow.id 
          ? { 
              ...editingShow, 
              ...newShow, 
              id: editingShow.id,
              bookedSeats: editingShow.bookedSeats 
            }
          : show
      ));
      setEditingShow(null);
      alert('Show updated successfully!');
    } else {
      const show: Show = {
        id: Date.now().toString(),
        ...newShow,
        bookedSeats: [],
        lockedSeats: {}
      };
      setShows([...shows, show]);
      alert('Show added successfully!');
    }
    
    setNewShow({
      name: '',
      date: '',
      time: '',
      totalSeats: 30,
      ticketPrice: 200,
      venue: '',
      description: '',
      posterUrl: ''
    });
  };

  const startEditShow = (show: Show) => {
    setEditingShow(show);
    setNewShow({
      name: show.name,
      date: show.date,
      time: show.time,
      totalSeats: show.totalSeats,
      ticketPrice: show.ticketPrice,
      venue: show.venue,
      description: show.description,
      posterUrl: show.posterUrl || ''
    });
  };

  const cancelEditShow = () => {
    setEditingShow(null);
    setNewShow({
      name: '',
      date: '',
      time: '',
      totalSeats: 30,
      ticketPrice: 200,
      venue: '',
      description: '',
      posterUrl: ''
    });
  };
  // Admin: Food items management
  const handleSaveFood = () => {
    if (!newFoodItem.name || newFoodItem.price <= 0) {
      alert('Please enter valid food name and price');
      return;
    }

    if (editingFood) {
      setAdminFood(adminFood.map(food => 
        food.id === editingFood.id 
          ? { ...editingFood, ...newFoodItem }
          : food
      ));
      setEditingFood(null);
      alert('Food item updated!');
    } else {
      const food: FoodItem = {
        id: 'f' + Date.now(),
        ...newFoodItem
      };
      setAdminFood([...adminFood, food]);
      alert('Food item added!');
    }

    setNewFoodItem({ name: '', price: 0, image: '🍿' });
  };

  const startEditFood = (food: FoodItem) => {
    setEditingFood(food);
    setNewFoodItem({ name: food.name, price: food.price, image: food.image });
  };

  const cancelEditFood = () => {
    setEditingFood(null);
    setNewFoodItem({ name: '', price: 0, image: '🍿' });
  };

  const deleteFood = (foodId: string) => {
    if (confirm('Delete this food item?')) {
      setAdminFood(adminFood.filter(f => f.id !== foodId));
    }
  };

  // Admin: Delete show
  const deleteShow = (showId: string) => {
    if (confirm('Are you sure you want to delete this show?')) {
      setShows(shows.filter(s => s.id !== showId));
    }
  };

  // Booking confirmation - UPDATES BOOKED SEATS
  const confirmBooking = () => {
    if (!selectedShow || selectedSeats.length === 0 || !userName.trim()) {
      alert('Please select seats and enter your name');
      return;
    }

    const bookingData: Booking = {
      show: selectedShow,
      selectedSeats: selectedSeats.sort((a, b) => a - b),
      foodItems: cart,
      totalAmount: calculateTotal()
    };

    // Update booked seats in the show and remove from locked
    setShows(shows.map(show => {
      if (show.id === selectedShow.id) {
        const updatedLockedSeats = { ...show.lockedSeats };
        selectedSeats.forEach(seat => delete updatedLockedSeats[seat]);
        return { 
          ...show, 
          bookedSeats: [...show.bookedSeats, ...selectedSeats],
          lockedSeats: updatedLockedSeats
        };
      }
      return show;
    }));

    // Save to booking records
    const record: BookingRecord = {
      id: Date.now().toString(),
      customerName: userName,
      customerEmail: userEmail || 'N/A',
      customerPhone: userPhone || 'N/A',
      movieName: selectedShow.name,
      movieDate: selectedShow.date,
      movieTime: selectedShow.time,
      seats: selectedSeats.sort((a, b) => a - b),
      foodItems: cart,
      totalAmount: calculateTotal(),
      bookingDate: new Date().toLocaleString('en-IN'),
      venue: selectedShow.venue
    };
    setBookingRecords([...bookingRecords, record]);
    setLastBookingId(record.id);

    setBooking(bookingData);
    setCurrentView('confirmation');
  };

  // Helper: try to find a booking id for this customer/movie/seats
  const findBookingId = (movieName: string, customer: string, seats: number[]): string | null => {
    // Try exact seat match first
    const exact = bookingRecords.find(b => b.movieName === movieName && b.customerName === customer && arraysEqual(b.seats, seats));
    if (exact) return exact.id;
    // Try overlapping seats
    const overlap = bookingRecords.find(b => b.movieName === movieName && b.customerName === customer && b.seats.some(s => seats.includes(s)));
    if (overlap) return overlap.id;
    // fallback to lastBookingId
    return lastBookingId;
  };

  const arraysEqual = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

  // Approve cancellation (admin)
  const approveCancellation = (cancellation: CancellationRequest) => {
    console.log('Approving cancellation:', cancellation);

    // find related booking record
    const targetBooking = bookingRecords.find(b => b.id === cancellation.bookingId);
    console.log('Related booking found for cancellationId:', cancellation.bookingId, 'targetBooking:', targetBooking);
    
    if (!targetBooking) {
      console.error('ERROR: No booking found for bookingId:', cancellation.bookingId, 'Available bookings:', bookingRecords.map(b => ({ id: b.id, movieName: b.movieName })));
      alert('Error: Could not find the associated booking record!');
      return;
    }

    // Update cancellation status
    setCancellationRequests(prev => {
      const next = prev.map(c => c.id === cancellation.id ? ({ ...c, status: 'approved' } as CancellationRequest) : c);
      console.log('Updated cancellationRequests (approved):', next.filter(r => r.id === cancellation.id));
      return next;
    });

    // Release seats back to the show
    setShows(prevShows => {
      const nextShows = prevShows.map(show => {
        if (show.name === targetBooking.movieName) {
          const updated = {
            ...show,
            bookedSeats: show.bookedSeats.filter(seat => !cancellation.seats.includes(seat))
          };
          console.log('Show updated for release:', show.name, 'before:', show.bookedSeats.length, 'after:', updated.bookedSeats.length);
          return updated;
        }
        return show;
      });
      return nextShows;
    });

    // Update booking records: remove seats. If no seats remain, DELETE the record entirely.
    setBookingRecords(prev => {
      console.log('Before setBookingRecords:', prev.length, 'records', prev.map(b => ({ id: b.id, seats: b.seats.length })));
      const updated = prev.map(b => {
        if (b.id === cancellation.bookingId) {
          const oldSeats = b.seats || [];
          const newSeats = oldSeats.filter(seat => !cancellation.seats.includes(seat));
          // Adjust food quantities proportionally to seats canceled
          const oldSeatCount = oldSeats.length || 1;
          const canceledCount = oldSeatCount - newSeats.length;
          const newFoodItems = (b.foodItems || []).map(fi => {
            const reduceBy = Math.round((fi.quantity * canceledCount) / oldSeatCount);
            const newQty = Math.max(0, fi.quantity - reduceBy);
            return { ...fi, quantity: newQty };
          });
          console.log('Booking matched! Old seats:', oldSeats, 'new seats:', newSeats, 'cancellation.seats:', cancellation.seats);
          return { ...b, seats: newSeats, foodItems: newFoodItems };
        }
        return b;
      }).filter(b => b.seats && b.seats.length > 0); // DELETE if no seats remain
      console.log('After setBookingRecords filter:', updated.length, 'records remain');
      return updated;
    });

    // If current in-memory booking matches, update it too (or clear if no seats left)
    if (booking && booking.show.name === targetBooking.movieName) {
      const remaining = booking.selectedSeats.filter(seat => !cancellation.seats.includes(seat));
      console.log('In-memory booking seats before:', booking.selectedSeats, 'after:', remaining);
      if (remaining.length === 0) {
        setBooking(null);
      } else {
        setBooking({ ...booking, selectedSeats: remaining });
      }
    }

    alert('Cancellation approved! Seats have been released.');
  };

  // Reject cancellation (admin)
  const rejectCancellation = (cancellation: CancellationRequest) => {
    setCancellationRequests(cancellationRequests.map(c =>
      c.id === cancellation.id ? { ...c, status: 'rejected' } : c
    ));
    alert('Cancellation request rejected.');
  };

  // Reset and go back
  const resetBooking = () => {
    setSelectedShow(null);
    setSelectedSeats([]);
    setCart([]);
    setBooking(null);
    setCurrentView('booking');
  };

  // ===== LOGIN VIEW =====
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">MODEX CINEMA</h1>
            <p className="text-gray-500">Book your tickets online</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setLoginType('signin')}
              className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm ${
                loginType === 'signin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => setLoginType('login')}
              className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm ${
                loginType === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-2 rounded-lg font-semibold transition text-xs ${
                loginType === 'admin'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Form */}
          {loginType === 'signin' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Create a new account</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password (min 8 chars) *</label>
                <input
                  type="password"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter a password (min 8 characters)"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            </div>
          ) : loginType === 'login' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Log in to your existing account</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Phone Number *</label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="john@example.com or 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-700 focus:outline-none"
                  placeholder="Enter admin password"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">Password: admin123</p>
              <button
                onClick={handleLogin}
                className="w-full py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                Admin Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== ADMIN VIEW =====
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">MODEX CINEMA - Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Tab Navigation */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setAdminTab('movies')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                adminTab === 'movies'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📽️ Movies
            </button>
            <button
              onClick={() => setAdminTab('food')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                adminTab === 'food'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🍕 Food Prices
            </button>
            <button
              onClick={() => setAdminTab('bookings')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                adminTab === 'bookings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Bookings
            </button>
            <button
              onClick={() => setAdminTab('cancellations')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                adminTab === 'cancellations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ❌ Cancellations ({cancellationRequests.filter(r => r.status === 'pending').length})
            </button>
          </div>

          {/* SECTION 1: MOVIES */}
          {adminTab === 'movies' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingShow ? 'Edit Show' : 'Add New Show'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Movie Name *</label>
                    <input
                      type="text"
                      value={newShow.name}
                      onChange={(e) => setNewShow({...newShow, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Pushpa 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
                    <input
                      type="text"
                      value={newShow.venue}
                      onChange={(e) => setNewShow({...newShow, venue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., MODEX CINEMA - Hall 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={newShow.date}
                      onChange={(e) => setNewShow({...newShow, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      value={newShow.time}
                      onChange={(e) => setNewShow({...newShow, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Total Seats *</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={newShow.totalSeats}
                      onChange={(e) => setNewShow({...newShow, totalSeats: parseInt(e.target.value) || 30})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ticket Price (₹) *</label>
                    <input
                      type="number"
                      min="50"
                      step="10"
                      value={newShow.ticketPrice}
                      onChange={(e) => setNewShow({...newShow, ticketPrice: parseInt(e.target.value) || 200})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={newShow.description}
                      onChange={(e) => setNewShow({...newShow, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows={2}
                      placeholder="Enter movie description"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Poster (jpg, jpeg, png)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const base64 = reader.result as string;
                          setNewShow({...newShow, posterUrl: base64});
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white"
                    />
                    {newShow.posterUrl && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Preview</p>
                        <img src={newShow.posterUrl} alt="poster" className="w-32 h-20 object-cover rounded" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button
                      onClick={handleSaveShow}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      {editingShow ? 'Update Show' : 'Add Show'}
                    </button>
                    {editingShow && (
                      <button
                        onClick={cancelEditShow}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">All Shows</h2>
                {shows.length === 0 ? (
                  <p className="text-gray-500">No shows added yet</p>
                ) : (
                  <div className="space-y-3">
                      {shows.map(show => (
                        <div key={show.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4 flex-1">
                            {show.posterUrl ? (
                              <img src={show.posterUrl} alt={show.name} className="w-24 h-16 object-cover rounded" />
                            ) : (
                              <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">No Poster</div>
                            )}
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{show.name}</h3>
                              <p className="text-gray-600 text-sm">{show.venue}</p>
                              <div className="flex gap-4 mt-2 text-sm text-gray-700 flex-wrap">
                                <span>📅 {new Date(show.date).toLocaleDateString()}</span>
                                <span>🕐 {show.time}</span>
                                <span>💺 {getAvailableSeats(show)}/{show.totalSeats} available</span>
                                <span className="font-bold text-green-600">₹{show.ticketPrice}/seat</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditShow(show)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteShow(show.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: FOOD PRICES */}
          {adminTab === 'food' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingFood ? 'Edit Food Item' : 'Add Food Item'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newFoodItem.name}
                      onChange={(e) => setNewFoodItem({...newFoodItem, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Popcorn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={newFoodItem.price}
                      onChange={(e) => setNewFoodItem({...newFoodItem, price: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., 150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji</label>
                    <input
                      type="text"
                      value={newFoodItem.image}
                      onChange={(e) => setNewFoodItem({...newFoodItem, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-2xl"
                      placeholder="🍿"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleSaveFood}
                    className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                  >
                    {editingFood ? 'Update Food' : 'Add Food'}
                  </button>
                  {editingFood && (
                    <button
                      onClick={cancelEditFood}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Food Menu</h3>
                {adminFood.length === 0 ? (
                  <p className="text-gray-500">No food items added yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {adminFood.map(food => (
                      <div key={food.id} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-3xl text-center mb-1">{food.image}</div>
                        <h4 className="font-semibold text-center text-gray-800 text-sm">{food.name}</h4>
                        <p className="text-green-600 font-bold text-center text-sm">₹{food.price}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => startEditFood(food)}
                            className="flex-1 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFood(food.id)}
                            className="flex-1 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: BOOKINGS */}
          {adminTab === 'bookings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Booking Records</h2>
                <button
                  onClick={() => {
                    // Export as CSV (include food items)
                    const csvRows: string[] = [];
                    const header = ['Movie', 'Customer Name', 'Phone', 'Email', 'Seats', 'Food Items', 'Date', 'Time', 'Amount'];
                    csvRows.push(header.join(','));
                    bookingRecords.forEach(r => {
                      const foodStr = (r.foodItems || []).map(fi => `${fi.name} x${fi.quantity}`).join('; ');
                      // wrap foodStr in quotes to keep commas safe
                      const row = [r.movieName, r.customerName, r.customerPhone, r.customerEmail, r.seats.join(';'), `"${foodStr.replace(/"/g, '""')}"`, r.movieDate, r.movieTime, r.totalAmount].join(',');
                      csvRows.push(row);
                    });
                    const csvContent = csvRows.join('\n');

                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
                    element.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  📥 Export CSV
                </button>
              </div>
              {bookingRecords.length === 0 ? (
                <p className="text-gray-500">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Customer Name</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Movie</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Date & Time</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Seats</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Food</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Booked On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingRecords.map(record => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold">{record.customerName}</td>
                          <td className="px-4 py-2 text-purple-600 font-mono">{record.customerPhone}</td>
                          <td className="px-4 py-2 text-blue-600 text-xs">{record.customerEmail}</td>
                          <td className="px-4 py-2 font-semibold">{record.movieName}</td>
                          <td className="px-4 py-2 text-xs">{record.movieDate} {record.movieTime}</td>
                          <td className="px-4 py-2 font-mono">{record.seats.join(', ')}</td>
                          <td className="px-4 py-2 text-sm">
                            {(record.foodItems || []).length === 0 ? (
                              <span className="text-gray-500">—</span>
                            ) : (
                              <div className="space-y-1">
                                {(record.foodItems || []).map(fi => (
                                  <div key={fi.id} className="text-gray-700">{fi.name} × {fi.quantity}</div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 font-bold text-green-600">₹{record.totalAmount}</td>
                          <td className="px-4 py-2 text-xs text-gray-500">{new Date(record.bookingDate).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {adminTab === 'cancellations' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Cancellation Requests</h2>
              
              {cancellationRequests.length === 0 ? (
                <p className="text-gray-500">No cancellation requests</p>
              ) : (
                <div className="space-y-4">
                  {cancellationRequests.map(request => (
                    <div key={request.id} className={`border rounded-lg p-4 ${
                      request.status === 'pending' ? 'bg-yellow-50 border-yellow-300' :
                      request.status === 'approved' ? 'bg-green-50 border-green-300' :
                      'bg-red-50 border-red-300'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600">Customer Name</p>
                          <p className="font-semibold text-gray-800">{request.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Movie</p>
                          <p className="font-semibold text-gray-800">{request.movieName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Seats</p>
                          <p className="font-semibold text-gray-800">{request.seats.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Request Date</p>
                          <p className="font-semibold text-gray-800">{request.requestDate}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-1">Reason for Cancellation</p>
                        <p className="text-gray-700 italic">"{request.reason}"</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          request.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-200 text-green-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveCancellation(request)}
                              className="px-4 py-1 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition text-sm"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectCancellation(request)}
                              className="px-4 py-1 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition text-sm"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== CONFIRMATION VIEW =====
  if (currentView === 'confirmation' && booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">MODEX CINEMA</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('my-bookings')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                📋 My Bookings
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Thank you for booking with MODEX CINEMA</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{booking.show.name}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Venue</p>
                  <p className="font-semibold text-gray-800">{booking.show.venue}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(booking.show.date).toLocaleDateString()} {booking.show.time}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Customer Name</p>
                  <p className="font-semibold text-gray-800">{userName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Seat Numbers</p>
                  <p className="font-semibold text-gray-800">{booking.selectedSeats.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-800 mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tickets ({booking.selectedSeats.length} × ₹{booking.show.ticketPrice})
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₹{booking.selectedSeats.length * booking.show.ticketPrice}
                  </span>
                </div>

                {booking.foodItems.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.name} ({item.quantity} × ₹{item.price})
                    </span>
                    <span className="font-semibold text-gray-800">₹{item.quantity * item.price}</span>
                  </div>
                ))}

                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total Amount</span>
                    <span className="text-green-600">₹{booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={resetBooking}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Book Another Show
            </button>
          </div>
        </div>
      </div>
      {/* Cancellation Modal for confirmation view */}
      {showCancelModal && booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            {cancelStage === 'confirm' ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Cancellation</h2>
                <p className="text-gray-600 mb-4">Are you sure you want to request cancellation for your booking of <strong>{booking.show.name}</strong>? This will ask for a reason which the admin will review.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelSeats([]);
                      setCancelReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    No, Keep Booking
                  </button>
                  <button
                    onClick={() => setCancelStage('form')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                  >
                    Yes, Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Cancel Booking</h2>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Seats to Cancel ({booking.selectedSeats.length} booked)
                  </label>
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {booking.selectedSeats.map(seat => (
                      <button
                        key={seat}
                        onClick={() => {
                          if (cancelSeats.includes(seat)) {
                            setCancelSeats(cancelSeats.filter(s => s !== seat));
                          } else {
                            setCancelSeats([...cancelSeats, seat]);
                          }
                        }}
                        className={`p-2 rounded font-semibold text-sm transition ${
                          cancelSeats.includes(seat)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                  {cancelSeats.length > 0 && (
                    <p className="text-sm text-gray-600">Cancelling {cancelSeats.length} seat{cancelSeats.length !== 1 ? 's' : ''}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Cancellation *</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for your cancellation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelSeats([]);
                      setCancelReason('');
                      setCancelStage('confirm');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (cancelSeats.length === 0) {
                        alert('Please select at least one seat to cancel');
                        return;
                      }
                      if (!cancelReason.trim()) {
                        alert('Please provide a reason for cancellation');
                        return;
                      }

                      const cancellation: CancellationRequest = {
                        id: Date.now().toString(),
                        bookingId: findBookingId(booking.show.name, customerName || userName, cancelSeats) || lastBookingId || bookingRecords[bookingRecords.length - 1]?.id || '',
                        customerName: customerName || userName,
                        movieName: booking.show.name,
                        reason: cancelReason.trim(),
                        status: 'pending',
                        requestDate: new Date().toLocaleString('en-IN'),
                        seats: cancelSeats.sort((a, b) => a - b)
                      };
                      console.log('Creating cancellation (modal):', cancellation);
                      setCancellationRequests([...cancellationRequests, cancellation]);
                      setShowCancelModal(false);
                      setCancelSeats([]);
                      setCancelReason('');
                      setCancelStage('confirm');
                      alert(`Cancellation request submitted for ${cancellation.seats.length} seat(s)! Admin will review it shortly.`);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Submit Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    );
  }

  // ===== MY BOOKINGS VIEW =====
  if (currentView === 'my-bookings') {
    const userBookings = bookingRecords.filter(b => b.customerName === userName || b.customerName === customerName);
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">MODEX CINEMA</h1>
              <p className="text-gray-300">My Bookings</p>
            </div>
            <button
              onClick={() => setCurrentView('booking')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6">
          {userBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No bookings yet</p>
              <button
                onClick={() => setCurrentView('booking')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Go to Bookings
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ℹ️ View your bookings and request cancellations. Admin will review and respond to your request shortly.
                </p>
              </div>
              {userBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-6 bg-blue-50 border-blue-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Movie</p>
                      <p className="font-semibold text-gray-800 text-lg">{booking.movieName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Seats</p>
                      <p className="font-semibold text-gray-800">{booking.seats.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Booking Date</p>
                      <p className="font-semibold text-gray-800">{booking.bookingDate}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-1">Show Details</p>
                    <p className="text-gray-700">{booking.movieDate} at {booking.movieTime} | Venue: {booking.venue}</p>
                  </div>
                  {(booking.foodItems || []).length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-1">Food Items</p>
                      <div className="space-y-1">
                        {(booking.foodItems || []).map(fi => (
                          <p key={fi.id} className="text-gray-700 text-sm">{fi.name} × {fi.quantity}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded font-semibold text-sm bg-green-200 text-green-800">
                      ✓ ACTIVE
                    </span>
                    <button
                      onClick={() => {
                        setSelectedUserBooking(booking);
                        setCancelSeats([]);
                        setCancelReason('');
                        setShowUserCancelModal(true);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded font-semibold hover:bg-orange-700 text-sm"
                    >
                      🛑 Request Cancellation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancellation Modal for My Bookings */}
        {showUserCancelModal && selectedUserBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              {cancelStage === 'confirm' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Cancellation</h2>
                  <p className="text-gray-600 mb-4">Are you sure you want to request cancellation for <strong>{selectedUserBooking.movieName}</strong>? Please select which seats and provide a reason.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowUserCancelModal(false);
                        setSelectedUserBooking(null);
                        setCancelSeats([]);
                        setCancelReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                      No, Keep Booking
                    </button>
                    <button
                      onClick={() => setCancelStage('form')}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                    >
                      Yes, Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Cancel Booking</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Seats to Cancel ({selectedUserBooking.seats.length} booked)
                    </label>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {selectedUserBooking.seats.map(seat => (
                        <button
                          key={seat}
                          onClick={() => {
                            if (cancelSeats.includes(seat)) {
                              setCancelSeats(cancelSeats.filter(s => s !== seat));
                            } else {
                              setCancelSeats([...cancelSeats, seat]);
                            }
                          }}
                          className={`p-2 rounded font-semibold text-sm transition ${
                            cancelSeats.includes(seat)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                    {cancelSeats.length > 0 && (
                      <p className="text-sm text-gray-600">Cancelling {cancelSeats.length} seat{cancelSeats.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Cancellation *</label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please provide a reason for your cancellation..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowUserCancelModal(false);
                        setSelectedUserBooking(null);
                        setCancelSeats([]);
                        setCancelReason('');
                        setCancelStage('confirm');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (cancelSeats.length === 0) {
                          alert('Please select at least one seat to cancel');
                          return;
                        }
                        if (!cancelReason.trim()) {
                          alert('Please provide a reason for cancellation');
                          return;
                        }

                        const cancellation: CancellationRequest = {
                          id: Date.now().toString(),
                          bookingId: selectedUserBooking.id,
                          customerName: selectedUserBooking.customerName,
                          movieName: selectedUserBooking.movieName,
                          reason: cancelReason.trim(),
                          status: 'pending',
                          requestDate: new Date().toLocaleString('en-IN'),
                          seats: cancelSeats.sort((a, b) => a - b)
                        };
                        console.log('Creating cancellation (My Bookings):', cancellation);
                        setCancellationRequests([...cancellationRequests, cancellation]);
                        setShowUserCancelModal(false);
                        setSelectedUserBooking(null);
                        setCancelSeats([]);
                        setCancelReason('');
                        setCancelStage('confirm');
                        alert(`Cancellation request submitted for ${cancellation.seats.length} seat(s)! Admin will review it shortly.`);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Submit Request
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== BOOKING VIEW =====
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">MODEX CINEMA</h1>
            <p className="text-gray-300">Welcome</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('my-bookings')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              📋 My Bookings
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!selectedShow ? (
          // Show Selection
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map(show => {
              const availableSeats = getAvailableSeats(show);
              const isHouseFull = availableSeats === 0;
              
              return (
                <div key={show.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
                  {/* Poster/Trailer Section */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {show.trailerUrl ? (
                      <iframe
                        src={show.trailerUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={show.name}
                      />
                    ) : show.posterUrl ? (
                      <img 
                        src={show.posterUrl} 
                        alt={show.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-800 text-white p-4">
                    <h2 className="text-xl font-bold">{show.name}</h2>
                    <p className="text-gray-300 text-xs">{show.venue}</p>
                  </div>
                  
                  <div className="p-4 space-y-3 flex-grow">
                    {/* Synopsis */}
                    <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                      <p className="text-gray-700 text-sm font-semibold mb-1">Story</p>
                      <p className="text-gray-600 text-sm">{show.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(show.date).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <span>🕐</span> {show.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span className={isHouseFull ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {isHouseFull ? 'HOUSE FULL' : `${availableSeats} SEATS AVAILABLE`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <IndianRupee className="w-4 h-4" />
                      <span className="text-lg font-bold">₹{show.ticketPrice}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedShow(show)}
                      disabled={isHouseFull}
                      className={`w-full py-2 rounded-lg font-semibold transition ${
                        isHouseFull
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isHouseFull ? 'HOUSE FULL' : 'Book Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Seat Selection & Food
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Seat Selection */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedShow.name}</h2>
                  <p className="text-gray-600">{selectedShow.venue}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedShow(null);
                    setSelectedSeats([]);
                    setCart([]);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  ← Back
                </button>
              </div>

              {/* Screen */}
              <div className="mb-8">
                <div className="bg-gray-700 text-white text-center py-2 rounded-t-2xl text-sm font-semibold">
                  🎬 SCREEN 🎬
                </div>
                <div className="h-1 bg-gray-400"></div>
              </div>

              {/* Seats Grid */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Select Your Seats</h3>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: selectedShow.totalSeats }, (_, i) => i + 1).map(seatNum => {
                    const cleanShow = cleanupExpiredLocks(selectedShow);
                    const isSelected = selectedSeats.includes(seatNum);
                    const isBooked = cleanShow.bookedSeats.includes(seatNum);
                    const isLocked = cleanShow.lockedSeats[seatNum] !== undefined;
                    
                    return (
                      <button
                        key={seatNum}
                        onClick={() => !isBooked && !isLocked && toggleSeat(seatNum)}
                        disabled={isBooked || isLocked}
                        className={`aspect-square rounded font-semibold text-xs transition-all ${
                          isBooked
                            ? 'bg-red-300 text-red-700 cursor-not-allowed'
                            : isLocked
                            ? 'bg-yellow-200 text-yellow-700 cursor-not-allowed'
                            : isSelected
                            ? 'bg-green-500 text-white scale-110 shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                        }`}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 text-xs mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded border border-gray-300"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-yellow-200 rounded"></div>
                  <span>Locked (10 min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-300 rounded"></div>
                  <span>Booked</span>
                </div>
              </div>

              {/* Food Items */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add Food & Beverages</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {adminFood.map(food => {
                    const qty = foodQtySelectors[food.id] || 0;
                    return (
                      <div key={food.id} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-3xl mb-1 text-center">{food.image}</div>
                        <h4 className="font-semibold text-gray-800 text-center text-sm">{food.name}</h4>
                        <p className="text-green-600 font-bold text-center text-sm">₹{food.price}</p>
                        
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            value={qty}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value);
                              setFoodQtySelectors({...foodQtySelectors, [food.id]: newQty});
                            }}
                            className="flex-1 px-2 py-1 border border-orange-300 rounded text-xs focus:outline-none bg-white"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              if (qty > 0) {
                                addToCart(food, qty);
                                setFoodQtySelectors({...foodQtySelectors, [food.id]: 0});
                              }
                            }}
                            disabled={qty === 0}
                            className={`px-2 py-1 text-xs rounded transition ${
                              qty === 0 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Cart & Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Summary
              </h3>

              {/* User Name */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Booking For</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Selected Seats */}
              {selectedSeats.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Selected Seats</p>
                  <p className="font-semibold text-blue-800">{selectedSeats.join(', ')}</p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-600">{selectedSeats.length} × ₹{selectedShow.ticketPrice}</span>
                    <span className="font-bold text-blue-600">₹{selectedSeats.length * selectedShow.ticketPrice}</span>
                  </div>
                </div>
              )}

              {/* Food Cart */}
              {cart.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Food Items</p>
                  {cart.map(item => (
                    <div key={item.id} className="p-2 bg-orange-50 rounded-lg text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{item.image} {item.name}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs"
                          >
                            −
                          </button>
                          <span className="font-bold w-5 text-center text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= 10}
                            className={`w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs transition ${
                              item.quantity >= 10 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">₹{item.price} each</p>
                          <p className="font-bold text-orange-600">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-3 mb-4">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-green-600">₹{calculateTotal()}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={confirmBooking}
                disabled={selectedSeats.length === 0 || !userName.trim()}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedSeats.length === 0 || !userName.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Modal (two-stage: confirm -> reason + seat selection) */}
        {showCancelModal && booking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              {cancelStage === 'confirm' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Cancellation</h2>
                  <p className="text-gray-600 mb-4">Are you sure you want to request cancellation for your booking of <strong>{booking.show.name}</strong>? This will ask for a reason which the admin will review.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCancelModal(false);
                        setCancelSeats([]);
                        setCancelReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                      No, Keep Booking
                    </button>
                    <button
                      onClick={() => setCancelStage('form')}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                    >
                      Yes, Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Cancel Booking</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Seats to Cancel ({booking.selectedSeats.length} booked)
                    </label>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {booking.selectedSeats.map(seat => (
                        <button
                          key={seat}
                          onClick={() => {
                            if (cancelSeats.includes(seat)) {
                              setCancelSeats(cancelSeats.filter(s => s !== seat));
                            } else {
                              setCancelSeats([...cancelSeats, seat]);
                            }
                          }}
                          className={`p-2 rounded font-semibold text-sm transition ${
                            cancelSeats.includes(seat)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                    {cancelSeats.length > 0 && (
                      <p className="text-sm text-gray-600">Cancelling {cancelSeats.length} seat{cancelSeats.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Cancellation *</label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please provide a reason for your cancellation..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCancelModal(false);
                        setCancelSeats([]);
                        setCancelReason('');
                        setCancelStage('confirm');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (cancelSeats.length === 0) {
                          alert('Please select at least one seat to cancel');
                          return;
                        }
                        if (!cancelReason.trim()) {
                          alert('Please provide a reason for cancellation');
                          return;
                        }

                        const cancellation: CancellationRequest = {
                          id: Date.now().toString(),
                          bookingId: lastBookingId || bookingRecords[bookingRecords.length - 1]?.id || '',
                          customerName: customerName || userName,
                          movieName: booking.show.name,
                          reason: cancelReason.trim(),
                          status: 'pending',
                          requestDate: new Date().toLocaleString('en-IN'),
                          seats: cancelSeats.sort((a, b) => a - b)
                        };
                        console.log('Creating cancellation (confirmation view):', cancellation);
                        setCancellationRequests([...cancellationRequests, cancellation]);
                        setShowCancelModal(false);
                        setCancelSeats([]);
                        setCancelReason('');
                        setCancelStage('confirm');
                        alert(`Cancellation request submitted for ${cancellation.seats.length} seat(s)! Admin will review it shortly.`);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Submit Request
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
