import { useState, useEffect } from 'react';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time?: string;
  status: string;
  total_amount: number;
  address: string;
  suburb: string;
  postcode: string;
  state: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  services: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

// Mock data
const mockBookings: Booking[] = [
  {
    id: '1',
    booking_date: '2024-01-15',
    start_time: '09:00',
    status: 'confirmed',
    total_amount: 150.00,
    address: '123 Main Street',
    suburb: 'Sydney',
    postcode: '2000',
    state: 'NSW',
    notes: 'Please call before arrival',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    customer: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john@example.com',
      phone: '0412345678'
    },
    services: [
      {
        id: '1',
        name: 'House Cleaning',
        description: 'Full house clean',
        quantity: 1,
        unit_price: 150.00,
        total_price: 150.00
      }
    ]
  },
  {
    id: '2',
    booking_date: '2024-01-16',
    start_time: '14:00',
    status: 'pending',
    total_amount: 200.00,
    address: '456 Oak Avenue',
    suburb: 'Melbourne',
    postcode: '3000',
    state: 'VIC',
    created_at: '2024-01-11T14:00:00Z',
    updated_at: '2024-01-11T14:00:00Z',
    customer: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah@example.com',
      phone: '0423456789'
    },
    services: [
      {
        id: '2',
        name: 'Deep Clean',
        description: 'Deep cleaning service',
        quantity: 1,
        unit_price: 200.00,
        total_price: 200.00
      }
    ]
  }
];

export const useLocalBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [loading, setLoading] = useState(false);

  const addBooking = (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === id 
          ? { ...booking, ...updates, updated_at: new Date().toISOString() }
          : booking
      )
    );
  };

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    refetch: () => {}
  };
};