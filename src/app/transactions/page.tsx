'use client';

import React, { useState } from 'react';
import { TransactionList } from '@/components/transactions/transaction-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, DollarSign } from 'lucide-react';

// Mock hosts data - replace with actual API call
const mockHosts = [
  { id: '04f1d0c6-0313-4051-8523-66241ef78335', name: 'Jane Smith' },
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'John Doe' },
  { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', name: 'Alice Johnson' },
];

export default function TransactionsPage() {
  const [selectedHostId, setSelectedHostId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | 'host'>('all');

  const handleHostChange = (hostId: string) => {
    setSelectedHostId(hostId === 'all' ? '' : hostId);
    setViewMode(hostId === 'all' ? 'all' : 'host');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Transaction Management
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage payment transactions
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            View Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                onClick={() => {
                  setViewMode('all');
                  setSelectedHostId('');
                }}
              >
                All Transactions
              </Button>
              <Button
                variant={viewMode === 'host' ? 'default' : 'outline'}
                onClick={() => setViewMode('host')}
              >
                Host Transactions
              </Button>
            </div>
            
            {viewMode === 'host' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Select Host:</span>
                <Select value={selectedHostId || 'all'} onValueChange={handleHostChange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Choose a host..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hosts</SelectItem>
                    {mockHosts.map((host) => (
                      <SelectItem key={host.id} value={host.id}>
                        {host.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <TransactionList 
        hostId={selectedHostId || undefined}
        showHostFilter={viewMode === 'all'}
      />
    </div>
  );
} 