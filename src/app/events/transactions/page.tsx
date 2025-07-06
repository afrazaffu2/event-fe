import { useEffect, useState } from 'react';
import { TransactionList } from '@/components/transactions/transaction-list';

export default function TransactionsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/razorpay-transactions')
            .then(res => res.json())
            .then(data => {
                setPayments(data.items || []);
                setLoading(false);
            });
    }, []);

    return (
        <div className="py-10">
            <h1 className="text-2xl font-bold mb-6">Transactions</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <TransactionList payments={payments} />
            )}
        </div>
    );
}
