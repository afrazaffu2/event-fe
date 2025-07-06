import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertCircle, DollarSign, Calendar, User, Mail, Phone, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_ENDPOINTS } from '@/lib/api';

const badgeColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
  default: 'bg-gray-100 text-gray-700',
  card: 'bg-blue-100 text-blue-700',
  bank_transfer: 'bg-purple-100 text-purple-700',
  paynow: 'bg-pink-100 text-pink-700',
  grabpay: 'bg-green-100 text-green-700',
  favepay: 'bg-orange-100 text-orange-700',
};

const PAGE_SIZE = 10;

type HitPayTransaction = {
  id: string;
  payment_type: string;
  payment_request_id: string;
  reference_number: string;
  amount: number;
  currency: string;
  status: string;
  email: string;
  name: string;
  purpose: string;
  host_id?: string;
  host_name?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
};

interface TransactionListProps {
  hostId?: string; 
  showHostFilter?: boolean; // Whether to show the host filter dropdown
}

export function TransactionList({ hostId, showHostFilter = true }: TransactionListProps) {
  const [transactions, setTransactions] = useState<HitPayTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [hostFilter, setHostFilter] = useState(hostId || 'all');
  const [hosts, setHosts] = useState<{id: string, name: string}[]>([]);

  // Fetch HitPay transactions with optional host filtering and pagination
  const fetchTransactions = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Build URL with host filter and pagination
      let url = API_ENDPOINTS.HITPAY_TRANSACTIONS;
      const params = new URLSearchParams();
      
      if (hostId) {
        params.append('host_id', hostId);
      }
      
      // Add pagination parameters
      params.append('page', pageNum.toString());
      params.append('per_page', PAGE_SIZE.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw API data:', data);
      
      // Handle different response formats
      let transactionsData = [];
      let totalCount = 0;
      
      if (Array.isArray(data.data)) {
        transactionsData = data.data;
        totalCount = data.total || data.data.length;
      } else if (Array.isArray(data)) {
        transactionsData = data;
        totalCount = data.length;
      } else if (data.payment_requests) {
        transactionsData = data.payment_requests;
        totalCount = data.total || data.payment_requests.length;
      } else {
        transactionsData = [];
        totalCount = 0;
      }
      
      setTransactions(transactionsData);
      setTotalCount(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error fetching HitPay transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
    setPage(1); // Reset to first page when hostId changes
  }, [hostId]); // Refetch when hostId changes

  // Sort transactions by created_at descending (latest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [transactions]);

  // Apply client-side filters (search only, since pagination is server-side)
  const filtered = sortedTransactions.filter(transaction => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        transaction.reference_number.toLowerCase().includes(searchLower) ||
        transaction.name.toLowerCase().includes(searchLower) ||
        transaction.email.toLowerCase().includes(searchLower) ||
        transaction.purpose.toLowerCase().includes(searchLower) ||
        (transaction.host_name && transaction.host_name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Calculate total pages based on server response
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Collect unique statuses, payment types, and hosts for filter dropdowns
  const statusOptions = Array.from(new Set(transactions.map(t => t.status))).filter(Boolean);
  const paymentTypeOptions = Array.from(new Set(transactions.map(t => t.payment_type))).filter(Boolean);
  
  // Extract unique hosts from transactions
  useEffect(() => {
    const hostMap = new Map();
    transactions
      .filter(t => t.host_id && t.host_name)
      .forEach(t => {
        if (!hostMap.has(t.host_id)) {
          hostMap.set(t.host_id, { id: t.host_id, name: t.host_name });
        }
      });
    setHosts(Array.from(hostMap.values()));
  }, [transactions]);

  // Debug: log transactions to console
  console.log('Transactions:', transactions);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle>
              {hostId ? 'Host Transactions' : 'HitPay Transactions'}
            </CardTitle>
            <CardDescription>Loading transaction data...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading transactions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle>
              {hostId ? 'Host Transactions' : 'HitPay Transactions'}
            </CardTitle>
            <CardDescription>Error loading transaction data</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
            <Button onClick={fetchTransactions} className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle>
              {hostId ? 'Host Transactions' : 'HitPay Transactions'}
            </CardTitle>
            <CardDescription>
              {hostId ? 'No transactions found for this host' : 'No transactions found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {hostId ? 'No transactions found for this host' : 'No transactions found'}
              </p>
              <Button onClick={() => fetchTransactions(1)} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen p-6">
      <Card className="w-full max-w-7xl mx-auto shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <DollarSign className="h-6 w-6 text-green-600" />
                {hostId ? 'Host Transactions' : 'HitPay Transactions'}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {hostId ? 'Transactions for this host' : 'List of all HitPay payment transactions'} • {filtered.length} total transactions
              </CardDescription>
            </div>
            <Button onClick={() => fetchTransactions(page)} variant="outline" size="sm" className="hover:bg-blue-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className={`grid grid-cols-1 ${showHostFilter ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
              {showHostFilter && !hostId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Filter</label>
                  <Select value={hostFilter} onValueChange={setHostFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Hosts" />
                    </SelectTrigger>
                                      <SelectContent>
                    <SelectItem value="all">All Hosts</SelectItem>
                    {hosts.map((host) => (
                      <SelectItem key={host.id} value={host.id}>
                        {host.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {paymentTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Reference</th>
                  {!hostId && <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Host</th>}
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Customer</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Purpose</th>
                  <th className="text-right p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Payment Type</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                  <th className="text-center p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((transaction, index) => {
                  const isSuccess = transaction.status === 'completed';
                  const isPending = transaction.status === 'pending';
                  const isFailed = transaction.status === 'failed';
                  return (
                    <tr 
                      key={transaction.id} 
                      className={`hover:bg-blue-50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-4">
                        <code className="bg-gray-100 px-3 py-1.5 rounded-md text-xs font-mono text-gray-700 border">
                          {transaction.reference_number}
                        </code>
                      </td>
                      {!hostId && (
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="h-3 w-3 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {transaction.host_name || 'Unknown Host'}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{transaction.name}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate" title={transaction.purpose}>
                          <span className="text-gray-700">{transaction.purpose}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-bold text-lg text-green-700">
                          ${(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">{transaction.currency}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${badgeColors[transaction.payment_methods?.[0]] || badgeColors.default} px-3 py-1 font-medium`}>
                          {transaction.payment_methods?.[0] || '-'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[150px]" title={transaction.email}>
                            {transaction.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge 
                          className={`px-3 py-1.5 font-medium ${
                            isSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 
                            isPending ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                            isFailed ? 'bg-red-100 text-red-700 border border-red-200' : 
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {isSuccess ? (
                            <span className="inline-flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" /> Completed
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center">
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Pending
                            </span>
                          ) : isFailed ? (
                            <span className="inline-flex items-center">
                              <XCircle className="w-4 h-4 mr-1" /> Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" /> {transaction.status}
                            </span>
                          )}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages || 1} • Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
              </span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (page > 1) {
                      setPage(page - 1);
                      fetchTransactions(page - 1);
                    }
                  }}
                  disabled={page === 1}
                  className="hover:bg-blue-50"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (page < totalPages) {
                      setPage(page + 1);
                      fetchTransactions(page + 1);
                    }
                  }}
                  disabled={page === totalPages || totalPages === 0}
                  className="hover:bg-blue-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 