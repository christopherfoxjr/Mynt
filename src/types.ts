export interface Transaction {
  id: string;
  name: string;
  type: 'receive' | 'spend' | 'send';
  amount: number;
  date: string;
  status: string;
  image?: string;
  category?: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Marcus Chen', type: 'receive', amount: 1250.00, date: '9:32 AM', status: 'completed', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
  { id: '2', name: 'Whole Foods Market', type: 'spend', amount: -124.50, category: 'Groceries', date: 'May 16', status: 'completed' },
  { id: '3', name: 'Dividend Income', type: 'receive', amount: 450.00, date: 'May 15', status: 'completed' },
  { id: '4', name: 'Sarah Jenkins', type: 'send', amount: -85.00, date: 'May 14', status: 'completed', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
];
