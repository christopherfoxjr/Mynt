import { auth } from '../lib/firebase';

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function safeFetch(url: string, options: RequestInit = {}, retries = 5) {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const text = await response.text();

    // Handle "Starting Server..." page from platform proxy (often returned as 200 OK or 503)
    if (text.includes('<!doctype html>') || text.includes('Starting Server') || text.includes('warming up')) {
      if (retries > 0) {
        console.warn(`Server warming up for ${url}. Retrying in 4s... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, 4000));
        return safeFetch(url, options, retries - 1);
      }
      throw new Error('Application is still starting up. Please try again in a moment.');
    }

    if (response.status === 401) {
      if (text.includes('Invalid token') && retries > 0) {
        console.warn('Invalid token detected, attempting force refresh...');
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          const newHeaders = {
            ...(options.headers as any || {}),
            'Authorization': `Bearer ${newToken}`
          };
          return safeFetch(url, { ...options, headers: newHeaders }, retries - 1);
        }
      }
    }

    if (!response.ok) {
      console.error(`Request to ${url} failed with status ${response.status}:`, text);
      try {
        const errorJson = JSON.parse(text);
        throw new Error(errorJson.error || `Request failed with status ${response.status}`);
      } catch (e) {
        throw new Error(text || `Request failed with status ${response.status}`);
      }
    }

    // Since we already called response.text(), we can't call response.json()
    // We must parse the text we already have
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(`Failed to parse JSON for ${url}:`, text.substring(0, 100));
      throw new Error('Server returned invalid JSON.');
    }
  } catch (error: any) {
    if (retries > 0 && (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Unexpected token'))) {
      console.warn(`Network error for ${url}. Retrying in 3s...`, error.message);
      await new Promise(r => setTimeout(r, 3000));
      return safeFetch(url, options, retries - 1);
    }
    throw error;
  }
}

export async function createConnectAccount(email: string, accountType: 'adult' | 'teen', birthDate: string) {
  const headers = await getAuthHeaders();
  return safeFetch('/api/create-connect-account', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, accountType, birthDate }),
  });
}

export async function createAccountLink(accountId: string) {
  const headers = await getAuthHeaders();
  return safeFetch('/api/create-account-link', {
    method: 'POST',
    headers,
    body: JSON.stringify({ accountId }),
  });
}

export async function createPaymentIntent(amount: number) {
  const headers = await getAuthHeaders();
  return safeFetch('/api/create-payment-intent', {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount }),
  });
}

export async function transferMoney(amount: number, recipientName: string, recipientId: string) {
  const headers = await getAuthHeaders();
  return safeFetch('/api/transfer', {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount, recipientName, recipientId }),
  });
}

export async function fetchBalance() {
  try {
    const headers = await getAuthHeaders();
    return await safeFetch('/api/balance', { headers });
  } catch (error) {
    console.error('Fetch Balance Error:', error);
    return { available: [{ amount: 0, currency: 'usd' }] };
  }
}

export async function fetchTransactions() {
  try {
    const headers = await getAuthHeaders();
    return await safeFetch('/api/transactions', { headers });
  } catch (error: any) {
    console.error('Fetch Transactions Error:', error.message);
    return [];
  }
}

export async function fetchUserProfile() {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/user/profile', { headers });
}

export async function claimLeaf(leaf: string) {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/user/leaf', {
    method: 'POST',
    headers,
    body: JSON.stringify({ leaf }),
  });
}

export async function findUserByLeaf(leaf: string) {
  const headers = await getAuthHeaders();
  return await safeFetch(`/api/user/leaf/${leaf}`, { headers });
}

export async function transferP2P(amount: number, recipientLeaf: string, description: string) {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/transfer/p2p', {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount, recipientLeaf, description }),
  });
}

export async function toggleCardStatus(frozen: boolean) {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/banking/card/toggle', {
    method: 'POST',
    headers,
    body: JSON.stringify({ frozen }),
  });
}

export async function fetchVaults() {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/banking/vaults', { headers });
}

export async function createVault(name: string, goal: number, targetDate?: string) {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/banking/vaults', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, goal, targetDate }),
  });
}

export async function setupFinancialAccount() {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/banking/financial-account', {
    method: 'POST',
    headers,
  });
}

export async function fetchAccountNumbers() {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/banking/account-numbers', { headers });
}

export async function depositFunds(amount: number, sourceId: string) {
  const headers = await getAuthHeaders();
  return await safeFetch('/api/banking/deposit', {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount, sourceId }),
  });
}
