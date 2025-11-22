# 🚀 Complete Setup Guide - FZ Mobile with Python Backend

## Quick Start (Local Development - No Hosting Required!)

### Step 1: Start the Python Backend

```bash
cd forex-engine

# Install dependencies (first time only)
pip install -r requirements.txt

# Start FastAPI backend
python -m uvicorn src.main:app --reload --port 8000 --host 0.0.0.0

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Note:** `--host 0.0.0.0` allows your phone/emulator to connect to it.

### Step 2: Configure Mobile App

```bash
cd fz-mobile

# Copy environment template
cp .env.example .env

# Edit .env with your setup
```

**For iOS Simulator:**
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

**For Android Emulator:**
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

**For Physical Device (iPhone/Android):**
```bash
# Find your computer's IP address:
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1
# Windows:
ipconfig

# Use that IP in .env:
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000  # YOUR IP HERE
```

### Step 3: Start Mobile App

```bash
cd fz-mobile
npm install  # First time only
npx expo start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR code for physical device

---

## ✅ What Works NOW (Without Any Hosting)

### 📊 Dashboard
- ✅ View account stats (equity, win rate, P/L)
- ✅ See active signals from Supabase
- ✅ Pull to refresh

### 🌍 Markets Screen
**Reading Data (from Supabase):**
- ✅ AI predictions for all pairs
- ✅ Technical indicators (RSI, MACD, ADX)
- ✅ Win probability & expected R:R

**Triggering Analysis (from Python Backend):**
- ✅ **Tap "🔄 Analyze" on any pair** → Calls Python backend → Gets instant results
- ✅ **Tap "Run All" button** → Scans all 6 major pairs
- ✅ Shows entry, SL, TP, R:R, confidence

### 🔔 Signals
- ✅ Filter by status (pending/active/completed/cancelled)
- ✅ View detailed signal cards
- ✅ See P/L for completed trades

### 🔄 Backtest
- ✅ View backtest results from Supabase
- ✅ See performance metrics

### 👤 Profile
- ✅ View/edit trading settings
- ✅ Equity, risk %, max trades per day
- ✅ Demo mode active (no auth required)

---

## 🔌 Available API Endpoints (ALL Integrated!)

| Endpoint | What It Does | Mobile Integration |
|----------|--------------|-------------------|
| `GET /` | Service info | ✅ Health check |
| `GET /api/health` | Backend status | ✅ Status monitoring |
| `GET /api/analyze/{pair}` | Analyze specific pair | ✅ Analyze button on Markets |
| `POST /api/scan-all` | Scan all pairs | ✅ "Run All" button |
| `GET /api/signals/recent` | Get recent signals | ✅ Signals screen |
| `GET /api/ohlc/{pair}` | Candlestick data | 🔄 Chart screen (coming) |
| `GET /api/indicators/{pair}` | Technical indicators | 🔄 Indicators screen (coming) |
| `GET /api/predictions` | ML predictions | ✅ Used in Markets |

---

## 🧪 Testing the Integration

### Test 1: Analyze EURUSD

1. Open mobile app
2. Go to **Markets** tab
3. Find **EURUSD** card
4. Tap **"🔄 Analyze"** button
5. Wait 2-3 seconds
6. See alert with:
   - Recommendation (BUY/SELL)
   - Entry price
   - Stop loss
   - Take profit
   - Risk:Reward ratio
   - Confidence percentage

**Expected Result:**
```
Analysis Complete
EURUSD: BUY
Entry: 1.08945
SL: 1.08720
TP: 1.09395
R:R: 1:2.00
Confidence: 75%
```

### Test 2: Scan All Pairs

1. Go to **Markets** tab
2. Tap **"Run All"** button (top right)
3. Wait ~10 seconds
4. See success message
5. Pull down to refresh
6. All pairs should have updated data

### Test 3: Check Backend Health

1. Open browser
2. Go to `http://localhost:8000`
3. Should see API info with all endpoints
4. Go to `http://localhost:8000/api/health`
5. Should see:
```json
{
  "status": "healthy",
  "strategy_engine": "active",
  "data_loader": "ready"
}
```

---

## 📱 Network Configuration for Different Devices

### iOS Simulator
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```
**Why:** Simulator shares localhost with your Mac

### Android Emulator
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```
**Why:** `10.0.2.2` is Android's special alias for host machine's localhost

### Physical iPhone/Android
```bash
# 1. Find your IP
ifconfig | grep "inet "  # Mac/Linux
ipconfig                  # Windows

# 2. Use your IP
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000

# 3. Make sure both devices on same WiFi
```

---

## 🔥 Troubleshooting

### "Failed to analyze" Error

**Problem:** Can't connect to Python backend

**Solutions:**
1. Check Python backend is running:
   ```bash
   curl http://localhost:8000/api/health
   # Should return JSON
   ```

2. Check `.env` file has correct URL

3. For physical device, verify:
   - Computer and phone on same WiFi
   - Firewall allows port 8000
   - Used correct IP address

4. Test connection from phone browser:
   - Open Safari/Chrome on phone
   - Go to `http://YOUR-IP:8000`
   - Should see API info

### "Network request failed"

**For Physical Device:**
```bash
# Add --host 0.0.0.0 when starting Python
python -m uvicorn src.main:app --reload --port 8000 --host 0.0.0.0

# Check firewall
# Mac: System Preferences → Security → Firewall → Allow port 8000
# Windows: Windows Defender → Allow port 8000
```

### Python Backend Won't Start

```bash
# Check Python version (need 3.8+)
python --version

# Install requirements
cd forex-engine
pip install -r requirements.txt

# Try running directly
python src/main.py
```

### Expo Won't Connect

```bash
# Clear Expo cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install

# Try different connection type
npx expo start --tunnel  # Uses ngrok
```

---

## 🎯 What's Next?

### Coming Soon (Currently Building)
- 📈 **Charts Screen** - OHLC candlestick charts using `/api/ohlc/{pair}`
- 🏗️ **Market Structures** - View FVG, BOS, Order Blocks, Liquidity zones
- 📝 **Trade Journal** - Full journaling functionality
- 📊 **Indicators Detail** - Dedicated screen for all technical indicators

### Data Flow

**Current Setup:**
```
Mobile App → FastAPI (Python) → Supabase
         ↓                            ↓
    Triggers Analysis           Reads Results
```

**Analysis Flow:**
1. User taps "Analyze EURUSD"
2. Mobile → `GET /api/analyze/EURUSD`
3. Python backend analyzes pair
4. Results saved to Supabase
5. Mobile reads from Supabase
6. Displays updated data

---

## 📊 Feature Parity with Web App

| Feature | Web App | Mobile App | Status |
|---------|---------|------------|--------|
| Dashboard | ✅ | ✅ | Complete |
| Markets/Analysis | ✅ | ✅ | Complete |
| Signals | ✅ | ✅ | Complete |
| Live Analysis Trigger | ✅ | ✅ | **NEW!** |
| Scan All Pairs | ✅ | ✅ | **NEW!** |
| Backtest Results | ✅ | ✅ | Complete |
| OHLC Charts | ✅ | 🔄 | Building |
| Market Structures | ✅ | 🔄 | Building |
| Trade Journal | ✅ | 🔄 | Building |
| Indicators Detail | ✅ | 🔄 | Building |

---

## 🚀 Production Deployment (When Ready)

### Option 1: Railway (Python Backend)
```bash
# Deploy Python backend to Railway
railway up

# Get URL (e.g., https://fz-backend.up.railway.app)

# Update mobile .env
EXPO_PUBLIC_API_URL=https://fz-backend.up.railway.app
```

### Option 2: ngrok (Quick Testing)
```bash
# Start Python backend
python -m uvicorn src.main:app --reload --port 8000

# In another terminal
ngrok http 8000

# Copy https URL
# Update mobile .env
EXPO_PUBLIC_API_URL=https://abc123.ngrok.io
```

---

## 💡 Pro Tips

1. **Keep Backend Running:** Python backend must be running for "Analyze" buttons to work
2. **Supabase Optional:** For read-only testing, you don't need Supabase setup yet
3. **Check Logs:** Watch Python terminal for request logs when analyzing
4. **Test Localhost First:** Always test localhost before trying phone
5. **Use IP for Testing:** Physical device testing easier with IP than ngrok

---

## 📞 Support

**Backend Issues:**
- Check `forex-engine` logs
- Verify OANDA credentials if using live data
- Ensure all Python dependencies installed

**Mobile Issues:**
- Check `.env` configuration
- Verify network connectivity
- Try clearing Expo cache: `npx expo start -c`

**Still Stuck?**
- Check Python backend terminal for errors
- Check Expo terminal for network errors
- Test API with curl/Postman first
- Verify firewall not blocking port 8000

---

## ✨ Summary

**You DON'T need:**
- ❌ Railway deployment
- ❌ ngrok (unless testing from external network)
- ❌ Next.js web app running
- ❌ Hosted database (for basic testing)

**You DO need:**
- ✅ Python backend running on port 8000
- ✅ Mobile app with correct API_URL in `.env`
- ✅ Both on same network (for physical device)

That's it! Start coding and testing locally. Deploy to Railway only when you're ready for production.
