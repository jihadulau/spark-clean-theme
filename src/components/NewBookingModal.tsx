import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLocalServices } from '@/hooks/useLocalServices';
import { Plus, Minus, Search, User, Calendar, Clock, MapPin, DollarSign } from 'lucide-react';

interface NewBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  suburb?: string;
  postcode?: string;
  state?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  duration_hours: number;
}

interface BookingItem {
  service: Service;
  quantity: number;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Services selection
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  
  // Booking details
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postcode, setPostcode] = useState('');
  const [state, setState] = useState('');
  const [notes, setNotes] = useState('');

  const { services } = useLocalServices();
  
  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  useEffect(() => {
    if (selectedCustomer) {
      setAddress(selectedCustomer.address || '');
      setSuburb(selectedCustomer.suburb || '');
      setPostcode(selectedCustomer.postcode || '');
      setState(selectedCustomer.state || '');
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    // Mock customers data
    setCustomers([
      {
        id: '1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        phone: '0412345678',
        address: '123 Main Street',
        suburb: 'Sydney',
        postcode: '2000',
        state: 'NSW'
      },
      {
        id: '2',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah@example.com',
        phone: '0423456789',
        address: '456 Oak Avenue',
        suburb: 'Melbourne',
        postcode: '3000',
        state: 'VIC'
      }
    ]);
  };

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name} ${customer.email}`
      .toLowerCase()
      .includes(customerSearch.toLowerCase())
  );

  const addService = (service: Service) => {
    const existingItem = bookingItems.find(item => item.service.id === service.id);
    if (existingItem) {
      setBookingItems(items =>
        items.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setBookingItems(items => [...items, { service, quantity: 1 }]);
    }
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      setBookingItems(items => items.filter(item => item.service.id !== serviceId));
    } else {
      setBookingItems(items =>
        items.map(item =>
          item.service.id === serviceId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const getTotalAmount = () => {
    return bookingItems.reduce((total, item) => 
      total + (item.service.base_price * item.quantity), 0
    );
  };

  const getTotalDuration = () => {
    return bookingItems.reduce((total, item) => 
      total + (item.service.duration_hours * item.quantity), 0
    );
  };

  const createBooking = async () => {
    if (!selectedCustomer || bookingItems.length === 0) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Booking created successfully (Demo mode).",
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
      setLoading(false);
    }, 1000);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setBookingItems([]);
    setBookingDate('');
    setStartTime('');
    setAddress('');
    setSuburb('');
    setPostcode('');
    setState('');
    setNotes('');
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1: return selectedCustomer !== null;
      case 2: return bookingItems.length > 0;
      case 3: return bookingDate && startTime && address && suburb && postcode && state;
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? 'Select Customer' : step === 2 ? 'Choose Services' : 'Booking Details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${
                    stepNumber < step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Customer Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Select Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers by name or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCustomer?.id === customer.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customer.email}
                            </p>
                            {customer.phone && (
                              <p className="text-sm text-muted-foreground">
                                {customer.phone}
                              </p>
                            )}
                          </div>
                          {selectedCustomer?.id === customer.id && (
                            <Badge>Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Services Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                  <CardDescription>Select services for this booking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <p className="text-sm font-medium text-green-600">
                            ${service.base_price.toFixed(2)} • {service.duration_hours}h
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addService(service)}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Services */}
              {bookingItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bookingItems.map((item) => (
                        <div key={item.service.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{item.service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.service.base_price.toFixed(2)} × {item.quantity} = ${(item.service.base_price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between items-center font-medium">
                        <span>Total: {getTotalDuration()}h</span>
                        <span className="text-green-600">${getTotalAmount().toFixed(2)} AUD</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Booking Details */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Booking Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booking-date">Date</Label>
                      <Input
                        id="booking-date"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Service Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="suburb">Suburb</Label>
                      <Input
                        id="suburb"
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        placeholder="Sydney"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="2000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NSW">NSW</SelectItem>
                          <SelectItem value="VIC">VIC</SelectItem>
                          <SelectItem value="QLD">QLD</SelectItem>
                          <SelectItem value="WA">WA</SelectItem>
                          <SelectItem value="SA">SA</SelectItem>
                          <SelectItem value="TAS">TAS</SelectItem>
                          <SelectItem value="ACT">ACT</SelectItem>
                          <SelectItem value="NT">NT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Customer Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions, access notes, etc..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="font-medium">
                        {selectedCustomer?.first_name} {selectedCustomer?.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span className="font-medium">
                        {bookingDate && new Date(bookingDate).toLocaleDateString('en-AU')} at {startTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{getTotalDuration()} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span className="font-medium">{bookingItems.length} service(s)</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-base">
                      <span>Total Amount:</span>
                      <span className="text-green-600">${getTotalAmount().toFixed(2)} AUD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceedToNextStep()}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={createBooking}
                  disabled={!canProceedToNextStep() || loading}
                >
                  {loading ? "Creating..." : "Create Booking"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};