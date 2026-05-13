export interface Transaction {
  id: string;
  name: string;
  type: 'receive' | 'spend' | 'send' | 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'reversed' | 'failed';
  image?: string;
  category?: string;
  reversable?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  leaf: string;
  transferLimit: number;
  createdAt: any;
}
