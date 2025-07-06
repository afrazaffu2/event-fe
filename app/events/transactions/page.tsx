'use client';
import { TransactionList } from '@/components/transactions/transaction-list';

export default function TransactionsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* <h1 className="text-2xl font-bold mb-6"> Transactions</h1> */}
            <TransactionList />
        </div>
    );
}
