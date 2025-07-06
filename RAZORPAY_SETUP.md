# 🔧 Razorpay Setup Guide

## 🚨 Current Issue: 401 Unauthorized Error

The error indicates that your Razorpay API key is not properly configured or is invalid.

## 📋 Setup Steps

### 1. **Get Your Razorpay Keys**

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign in to your account
3. Go to **Settings** → **API Keys**
4. Generate a new key pair or copy existing ones

### 2. **Environment Variables**

Create a `.env.local` file in your frontend directory:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key

# For Production (when ready)
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
# RAZORPAY_KEY_SECRET=your_live_secret_key

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.95:8000
```

### 3. **Important Notes**

- **Test vs Live Keys**: Use test keys for development, live keys for production
- **Key Format**: 
  - Test keys start with `rzp_test_`
  - Live keys start with `rzp_live_`
- **Environment Variable**: Must be `NEXT_PUBLIC_RAZORPAY_KEY_ID` (not `RAZORPAY_KEY_ID`)

### 4. **Restart Development Server**

After setting environment variables:

```bash
npm run dev
# or
yarn dev
```

### 5. **Verify Configuration**

Check browser console for:
- ✅ "Razorpay is configured" message
- ❌ "Razorpay is not configured" warning

## 🔍 Troubleshooting

### **Issue 1: 401 Unauthorized**
**Cause**: Invalid or missing API key
**Solution**: 
1. Verify your API key is correct
2. Ensure environment variable is set
3. Restart development server

### **Issue 2: Key Not Found**
**Cause**: Environment variable not loaded
**Solution**:
1. Check `.env.local` file exists
2. Verify variable name: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
3. Restart development server

### **Issue 3: Test vs Live Keys**
**Cause**: Using live keys in development
**Solution**: Use test keys for development, live keys for production

## 🧪 Testing

1. **Test Payment**: Use Razorpay test cards
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits

2. **Test UPI**: Use `success@razorpay`

## 📞 Support

If issues persist:
1. Check Razorpay dashboard for key status
2. Verify account is active
3. Contact Razorpay support if needed 