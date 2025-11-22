# FZ Mobile - Architecture & API Integration

## Overview

The FZ Mobile app connects to the same backend as the web version to trigger forex pair analysis and retrieve trading data.

## Architecture Diagram

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌──────────────┐
│ API Service    │  │   Supabase   │
│ (api-service)  │  │  (Database)  │
└───────┬────────┘  └──────────────┘
        │                 ▲
        │                 │
        ▼                 │
┌────────────────┐        │
│  Next.js API   │        │
│    Routes      │        │
└───────┬────────┘        │
        │                 │
        ▼                 │
┌────────────────┐        │
│ Python Backend │────────┘
│ (forex-engine) │
└────────────────┘
```

## How It Works

### 1. Data Reading (Current Implementation)
The mobile app **directly reads** from Supabase:
- Trade signals
- Market predictions
- Technical indicators
- Backtest results
- User settings

### 2. Triggering Analysis (NEW - Just Added)
When a user wants to analyze a pair like GBPUSD:

```typescript
// User taps "Analyze" on GBPUSD
handleAnalyzePair('GBPUSD')
  ↓
// Mobile app calls API service
apiService.analyzePair({ pair: 'GBPUSD', timeframes: ['30m', '4H', '1D'] })
  ↓
// Sends POST request to web API
POST http://your-web-app.com/api/analyze
{
  "pair": "GBPUSD",
  "timeframes": ["30m", "4H", "1D"],
  "forceRefresh": true
}
  ↓
// Web API triggers Python backend
Python forex-engine runs analysis
  ↓
// Results saved to Supabase
- trade_signals table
- ai_predictions table
- technical_indicators table
- fair_value_gaps table
- order_blocks table
  ↓
// Mobile app refreshes data from Supabase
fetchMarketData() - reads latest results
```

## Required API Endpoints (Web Version)

Your Next.js web app needs these API routes:

### `/api/analyze` (POST)
Analyze a specific currency pair

**Request:**
```json
{
  "pair": "GBPUSD",
  "timeframes": ["30m", "4H", "1D"],
  "forceRefresh": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analysis completed for GBPUSD",
  "data": {
    "signals": [...],
    "predictions": {...},
    "indicators": {...}
  }
}
```

### `/api/analyze/market` (POST)
Analyze all major pairs

**Request:** (Empty body or config)

**Response:**
```json
{
  "success": true,
  "message": "Market analysis started for 6 pairs",
  "data": {
    "processed": ["EURUSD", "GBPUSD", "USDJPY", ...]
  }
}
```

### `/api/analyze/status` (GET)
Get analysis engine status

**Response:**
```json
{
  "isRunning": false,
  "lastRun": "2025-01-15T10:30:00Z",
  "nextRun": "2025-01-15T11:00:00Z"
}
```

### `/api/pairs` (GET)
Get available pairs

**Response:**
```json
{
  "pairs": ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD"]
}
```

## Setup Instructions

### 1. Start Your Web API

Make sure your web version is running:

```bash
cd path/to/fz-web
npm run dev  # or your start command
# Should be running on http://localhost:3000
```

### 2. Configure Mobile App

Create `.env` file in mobile app:

```bash
cd fz-mobile
cp .env.example .env
```

Edit `.env`:
```
# Point to your web API (local dev)
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For production/deployment
# EXPO_PUBLIC_API_URL=https://your-web-app.com/api

# Also set Supabase (for reading data)
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Network Configuration

**For Local Development:**

If testing on a physical device, use your computer's IP address:

```bash
# Find your IP
# On Mac/Linux:
ifconfig | grep "inet "
# On Windows:
ipconfig

# Update .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api  # Your IP here
```

**For iOS Simulator:**
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**For Android Emulator:**
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

### 4. CORS Configuration

Your web API needs to allow requests from the mobile app.

In your Next.js app, add CORS headers:

```typescript
// pages/api/analyze.ts (or wherever your API routes are)

export default async function handler(req, res) {
  // Allow mobile app requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Your existing API logic...
}
```

Or use a middleware like `next-cors`.

## Usage in Mobile App

### Markets Screen

Each pair card has an "Analyze" button:

```typescript
// Tap analyze button on GBPUSD card
→ Triggers API call to analyze GBPUSD
→ Shows "Analysis started" alert
→ Waits 3 seconds
→ Refreshes data from Supabase
→ New signals/predictions appear
```

**"Run All" button:**
```typescript
// Tap "Run All" button
→ Triggers analysis for all major pairs
→ Shows "Market analysis started" alert
→ Waits 5 seconds
→ Refreshes data
→ All pairs updated
```

## Data Flow

### Reading Data (Always)
```
Mobile App → Supabase → Display
```

### Writing Data (Through API)
```
Mobile App → Web API → Python Backend → Supabase
            ↑                                ↓
            └───── Refresh Data ─────────────┘
```

## Troubleshooting

### "Failed to trigger analysis"

**Cause:** Can't reach web API

**Solutions:**
1. Check web API is running (`http://localhost:3000`)
2. Verify `EXPO_PUBLIC_API_URL` in `.env`
3. Check network connectivity
4. Try using IP address instead of localhost
5. Check CORS configuration

### "Analysis started but no data appears"

**Cause:** Python backend might not be saving to Supabase

**Solutions:**
1. Check Python backend logs
2. Verify Supabase credentials in web app
3. Manually refresh data (pull down on screen)
4. Check Supabase tables for new data

### Network errors on physical device

**Cause:** Device can't reach localhost

**Solution:**
1. Use your computer's IP address in `.env`
2. Make sure device and computer are on same WiFi
3. Check firewall isn't blocking port 3000

## Alternative: Direct Python Backend

If you want to skip the Next.js API layer:

1. Expose Python backend with FastAPI
2. Update `api-service.ts` to call Python directly
3. Add authentication headers if needed

Example:
```typescript
// lib/services/api-service.ts
const API_BASE_URL = 'http://localhost:8000';  // Python backend

async analyzePair(request) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });
}
```

## Production Deployment

For production, use environment variables:

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://api.fzforex.com/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

Build with:
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Security Considerations

1. **API Authentication:** Add API keys or JWT tokens for production
2. **Rate Limiting:** Prevent abuse of analysis endpoints
3. **HTTPS:** Always use HTTPS in production
4. **Environment Variables:** Never commit `.env` files

## Summary

The mobile app uses a **hybrid approach**:
- **Reads** data directly from Supabase (fast, real-time)
- **Writes** data through API → Python backend → Supabase (controlled, processed)

This ensures data integrity while maintaining the separation between frontend and backend logic.
