import React from 'react';
import { TransactionList } from './transaction-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, DollarSign } from 'lucide-react';

interface HostTransactionsProps {
  hostId: string;
  hostName?: string;
}

export function HostTransactions({ hostId, hostName }: HostTransactionsProps) {
  return (
    <div className="space-y-6">
      {/* Host Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {hostName ? `${hostName}'s Transactions` : 'Host Transactions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Viewing transactions for this host's events</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <TransactionList 
        hostId={hostId}
        showHostFilter={false}
      />
    </div>
  );
} 