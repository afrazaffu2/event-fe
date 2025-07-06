import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Debug log to check if env variables are being read
  // console.log('RZP KEY:', process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET ? 'set' : 'not set');

  const key_id = process.env.RAZORPAY_KEY_ID!;
  const key_secret = process.env.RAZORPAY_KEY_SECRET!;
  const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/payments', {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    return res.status(response.status).json({ error });
  }

  const data = await response.json();
  res.status(200).json(data);
} 