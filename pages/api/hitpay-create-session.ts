import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = 'test_06b2632b5b7852da8076f1a08a15375ad1651972fe9d457be3d5f45a8cde2418';
  const url = 'https://api.sandbox.hit-pay.com/v1/payment-requests';

  try {
    const hitpayRes = await fetch(url, {
      method: 'POST',
      headers: {
        'X-BUSINESS-API-KEY': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data: any = await hitpayRes.json();
    if (!hitpayRes.ok) {
      return res.status(400).json({ error: data.message || 'HitPay error' });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
} 