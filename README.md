# FZ Mobile - Forex Trading Platform

A mobile application for forex trading built with Expo and React Native, replicating the functionality of the [FZ web platform](https://github.com/tgoky/fz).

## Features

- **Real-time Market Data** - Live forex pair analysis with AI predictions
- **Trade Signals** - Smart trading signals with entry, stop loss, and take profit levels
- **Market Structures** - Fair Value Gaps (FVG), Break of Structure (BOS), Order Blocks (OB), and Liquidity Zones
- **Technical Indicators** - RSI, MACD, ADX, Bollinger Bands, EMAs, and more
- **Backtesting** - Test your trading strategies with historical data
- **Trade Journal** - Track and analyze your trades
- **User Settings** - Customize equity, risk management, and trading preferences
- **Authentication** - Secure login/signup with Supabase

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Charts**: React Native Chart Kit
- **Styling**: React Native StyleSheet

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account and project

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/tgoky/fz-mobile.git
cd fz-mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema from the provided SQL file in your Supabase SQL Editor
3. Get your Supabase URL and Anon Key from Project Settings > API

### 4. Configure environment variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 5. Start the development server

```bash
npx expo start
```

### 6. Run on your device

- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Physical Device**: Scan the QR code with Expo Go app

## Project Structure

```
fz-mobile/
├── app/                    # Application screens and navigation
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/            # Main tab screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── markets.tsx    # Market analysis
│   │   ├── signals.tsx    # Trade signals
│   │   ├── backtest.tsx   # Backtesting
│   │   └── profile.tsx    # User profile & settings
│   └── _layout.tsx        # Root layout with auth protection
├── lib/                   # Core library files
│   ├── supabase.ts       # Supabase client configuration
│   ├── database.types.ts # TypeScript types for database
│   ├── store/            # State management (Zustand)
│   │   └── auth-store.ts
│   └── hooks/            # Custom React hooks
│       ├── use-signals.ts
│       └── use-user-settings.ts
├── components/           # Reusable UI components
├── constants/           # App constants and theme
└── assets/             # Images, fonts, etc.
```

## Database Schema

The app uses the same database schema as the web version with 18 tables:

- **User Management**: user_profiles, user_settings
- **Market Structures**: fair_value_gaps, break_of_structures, order_blocks, liquidity_zones, price_rejections
- **Trade Signals**: trade_signals
- **ML Predictions**: ai_predictions, technical_indicators
- **Backtesting**: backtest_runs, backtest_trades, backtest_results
- **Journal**: trade_journal, activity_logs
- **Notifications**: alert_configurations, notifications
- **Historical Data**: ohlc_candles

## Key Features Explained

### Dashboard
- Account overview with equity, active signals, win rate, and P/L
- Quick view of active trade signals
- Real-time data refresh

### Markets
- AI-powered trade recommendations for major pairs
- Technical indicators (RSI, MACD, ADX)
- Win probability and expected risk/reward ratios

### Signals
- Filter signals by status (pending, active, completed, cancelled)
- Detailed signal information including entry, SL, TP
- Confidence levels and P/L tracking

### Backtest
- Historical strategy testing
- Comprehensive performance metrics
- Win rate, profit factor, max drawdown analysis

### Profile
- Manage account equity and risk settings
- Configure trading preferences
- View preferred pairs and timeframes

## Development

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Lint code
npm run lint
```

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## Related Projects

- [FZ Web Platform](https://github.com/tgoky/fz) - The web version of this forex trading platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For questions or issues, please open an issue on GitHub.
