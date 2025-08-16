import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Calendar } from './components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { toast, Toaster } from 'sonner';
import { Car, Calendar as CalendarIcon, Clock, Star, Sparkles, Droplets, Crown, Zap, User, Plus, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

axios.defaults.withCredentials = true;

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (sessionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login?session_id=${sessionId}`);
      setUser(response.data.user);
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => React.useContext(AuthContext);

// Landing Page Component
function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/profile';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-white/10">
        <div className="flex items-center space-x-2">
          <Car className="w-8 h-8 text-yellow-400" />
          <span className="text-2xl font-bold text-white">AquaWash</span>
        </div>
        <Button onClick={handleLogin} className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105">
          Login / Sign Up
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 animate-fade-in-up">
            Futuristic Car Wash
            <span className="text-yellow-400 block">Experience</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Book premium car washing services with just a few taps. Multiple cars, flexible scheduling, and world-class service quality.
          </p>
          <Button onClick={handleLogin} className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Get Started Today
          </Button>
        </div>

        {/* Services Preview */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Zap, name: "Quick Touchless", price: "$15.99", desc: "Fast & efficient" },
            { icon: Sparkles, name: "Inside Out Wash", price: "$35.99", desc: "Complete cleaning" },
            { icon: Crown, name: "Gold Wash", price: "$49.99", desc: "Ultimate luxury" }
          ].map((service, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center pb-4">
                <service.icon className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="text-blue-100">{service.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{service.price}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: Car, title: "Multiple Cars", desc: "Manage all your vehicles" },
            { icon: CalendarIcon, title: "Easy Scheduling", desc: "Book at your convenience" },
            { icon: Star, title: "Premium Services", desc: "6 service levels available" },
            { icon: CheckCircle, title: "Instant Booking", desc: "Confirm in seconds" }
          ].map((feature, index) => (
            <div key={index} className="text-white">
              <feature.icon className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-blue-100 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-6 text-center text-blue-100">
          <p>&copy; 2024 AquaWash. Premium car washing services at your fingertips.</p>
        </div>
      </footer>
    </div>
  );
}

// Profile Page Component (handles auth redirect)
function ProfilePage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check for session ID in URL fragment
      const hash = location.hash;
      if (hash && hash.includes('session_id=')) {
        const sessionId = hash.split('session_id=')[1];
        const success = await login(sessionId);
        if (success) {
          navigate('/dashboard');
        }
      } else if (user) {
        navigate('/dashboard');
      }
    };

    handleAuthRedirect();
  }, [location, login, navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p>Processing authentication...</p>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth();
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddCar, setShowAddCar] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCar, setSelectedCar] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);

  // Car form state
  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: ''
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carsRes, servicesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/cars`),
        axios.get(`${API_BASE_URL}/api/services`),
        axios.get(`${API_BASE_URL}/api/bookings`)
      ]);
      
      setCars(carsRes.data);
      setServices(servicesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/cars`, carForm);
      toast.success('Car added successfully!');
      setCarForm({ make: '', model: '', year: '', license_plate: '' });
      setShowAddCar(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add car');
    }
  };

  const handleDeleteCar = async (carId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cars/${carId}`);
      toast.success('Car deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete car');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedCar || !selectedService || !selectedDate || !selectedTime) {
      toast.error('Please fill in all booking details');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        car_id: selectedCar,
        service_id: selectedService,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime
      });
      
      toast.success('Booking created successfully!');
      setShowBooking(false);
      setSelectedCar('');
      setSelectedService('');
      setSelectedDate(null);
      setSelectedTime('');
      fetchData();
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const getServiceIcon = (serviceName) => {
    if (serviceName.includes('Touchless')) return Zap;
    if (serviceName.includes('Inside Out')) return Sparkles;
    if (serviceName.includes('Polish')) return Star;
    if (serviceName.includes('Gold')) return Crown;
    if (serviceName.includes('Silver')) return Star;
    return Droplets;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-white/10">
        <div className="flex items-center space-x-2">
          <Car className="w-8 h-8 text-yellow-400" />
          <span className="text-2xl font-bold text-white">AquaWash</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white">
            <User className="w-5 h-5" />
            <span>{user?.name}</span>
          </div>
          <Button onClick={logout} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-blue-100">Manage your cars and bookings</p>
        </div>

        <Tabs defaultValue="cars" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="cars" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-blue-900">My Cars</TabsTrigger>
            <TabsTrigger value="services" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-blue-900">Services</TabsTrigger>
            <TabsTrigger value="bookings" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-blue-900">Bookings</TabsTrigger>
          </TabsList>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Your Cars</h2>
              <Dialog open={showAddCar} onOpenChange={setShowAddCar}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Car
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-blue-900 border-blue-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Car</DialogTitle>
                    <DialogDescription className="text-blue-100">
                      Add your car details to start booking services.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCar} className="space-y-4">
                    <div>
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        value={carForm.make}
                        onChange={(e) => setCarForm({...carForm, make: e.target.value})}
                        className="bg-blue-800 border-blue-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={carForm.model}
                        onChange={(e) => setCarForm({...carForm, model: e.target.value})}
                        className="bg-blue-800 border-blue-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={carForm.year}
                        onChange={(e) => setCarForm({...carForm, year: e.target.value})}
                        className="bg-blue-800 border-blue-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="license_plate">License Plate</Label>
                      <Input
                        id="license_plate"
                        value={carForm.license_plate}
                        onChange={(e) => setCarForm({...carForm, license_plate: e.target.value})}
                        className="bg-blue-800 border-blue-600 text-white"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900">
                      Add Car
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Card key={car.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-yellow-400">{car.make} {car.model}</CardTitle>
                        <CardDescription className="text-blue-100">Year: {car.year}</CardDescription>
                        <Badge variant="outline" className="mt-2 border-yellow-400 text-yellow-400">
                          {car.license_plate}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteCar(car.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {cars.length === 0 && (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">No cars added yet</p>
                <p className="text-blue-100 mb-6">Add your first car to start booking services</p>
              </div>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Available Services</h2>
              <Button 
                onClick={() => setShowBooking(true)} 
                className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold"
                disabled={cars.length === 0}
              >
                Book Service
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const IconComponent = getServiceIcon(service.name);
                return (
                  <Card key={service.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="text-center">
                      <IconComponent className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <CardDescription className="text-blue-100">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">${service.price}</div>
                      <div className="text-sm text-blue-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration_minutes} minutes
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Booking Dialog */}
            <Dialog open={showBooking} onOpenChange={setShowBooking}>
              <DialogContent className="bg-blue-900 border-blue-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Book a Service</DialogTitle>
                  <DialogDescription className="text-blue-100">
                    Choose your car, service, date and time.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <Label>Select Car</Label>
                    <Select value={selectedCar} onValueChange={setSelectedCar}>
                      <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                        <SelectValue placeholder="Choose a car" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800 border-blue-600">
                        {cars.map((car) => (
                          <SelectItem key={car.id} value={car.id} className="text-white hover:bg-blue-700">
                            {car.make} {car.model} ({car.license_plate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Select Service</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                        <SelectValue placeholder="Choose a service" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800 border-blue-600">
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id} className="text-white hover:bg-blue-700">
                            {service.name} - ${service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-blue-800 border-blue-600 text-white hover:bg-blue-700">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-blue-800 border-blue-600">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().toDateString())}
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Select Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                        <SelectValue placeholder="Choose time" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800 border-blue-600">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time} className="text-white hover:bg-blue-700">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900">
                    Book Service
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Bookings</h2>
            
            <div className="space-y-4">
              {bookings.map((booking) => {
                const IconComponent = getServiceIcon(booking.service?.name || '');
                return (
                  <Card key={booking.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <IconComponent className="w-8 h-8 text-yellow-400 mt-1" />
                          <div>
                            <CardTitle className="text-yellow-400 mb-1">
                              {booking.service?.name}
                            </CardTitle>
                            <CardDescription className="text-blue-100 mb-2">
                              {booking.car?.make} {booking.car?.model} ({booking.car?.license_plate})
                            </CardDescription>
                            <div className="flex items-center space-x-4 text-sm text-blue-100">
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {booking.booking_date}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {booking.booking_time}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400 mb-2">
                            ${booking.total_price}
                          </div>
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'destructive'}
                            className={booking.status === 'confirmed' ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {booking.status}
                          </Badge>
                          {booking.status === 'confirmed' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="ml-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {bookings.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">No bookings yet</p>
                <p className="text-blue-100 mb-6">Book your first service to get started</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;