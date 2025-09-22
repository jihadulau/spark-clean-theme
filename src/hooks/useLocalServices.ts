import { useState } from 'react';

interface Service {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  duration_hours: number;
  is_active: boolean;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'House Cleaning',
    description: 'Complete house cleaning service',
    base_price: 150.00,
    duration_hours: 3,
    is_active: true
  },
  {
    id: '2',
    name: 'Deep Clean',
    description: 'Intensive deep cleaning service',
    base_price: 200.00,
    duration_hours: 4,
    is_active: true
  },
  {
    id: '3',
    name: 'Window Cleaning',
    description: 'Professional window cleaning',
    base_price: 80.00,
    duration_hours: 2,
    is_active: true
  }
];

export const useLocalServices = () => {
  const [services] = useState<Service[]>(mockServices);
  const [loading] = useState(false);

  return {
    services: services.filter(s => s.is_active),
    loading,
    refetch: () => {}
  };
};