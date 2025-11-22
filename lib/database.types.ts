export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          equity: number
          risk_percent: number
          preferred_pairs: string
          preferred_timeframes: string
          trade_notifications_enabled: boolean
          max_trades_per_day: number
          auto_close_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          equity?: number
          risk_percent?: number
          preferred_pairs?: string
          preferred_timeframes?: string
          trade_notifications_enabled?: boolean
          max_trades_per_day?: number
          auto_close_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          equity?: number
          risk_percent?: number
          preferred_pairs?: string
          preferred_timeframes?: string
          trade_notifications_enabled?: boolean
          max_trades_per_day?: number
          auto_close_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      fair_value_gaps: {
        Row: {
          id: string
          pair: string
          timeframe: string
          gap_type: 'bullish' | 'bearish'
          top: number
          bottom: number
          formed_at: string
          candle_index: number
          is_filled: boolean
          filled_at: string | null
          strength: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: string
          timeframe: string
          gap_type: 'bullish' | 'bearish'
          top: number
          bottom: number
          formed_at: string
          candle_index: number
          is_filled?: boolean
          filled_at?: string | null
          strength?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: string
          timeframe?: string
          gap_type?: 'bullish' | 'bearish'
          top?: number
          bottom?: number
          formed_at?: string
          candle_index?: number
          is_filled?: boolean
          filled_at?: string | null
          strength?: number
          created_at?: string
          updated_at?: string
        }
      }
      break_of_structures: {
        Row: {
          id: string
          pair: string
          timeframe: string
          bos_type: 'bullish' | 'bearish'
          break_level: number
          previous_high: number | null
          previous_low: number | null
          occurred_at: string
          candle_index: number
          confirmed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: string
          timeframe: string
          bos_type: 'bullish' | 'bearish'
          break_level: number
          previous_high?: number | null
          previous_low?: number | null
          occurred_at: string
          candle_index: number
          confirmed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: string
          timeframe?: string
          bos_type?: 'bullish' | 'bearish'
          break_level?: number
          previous_high?: number | null
          previous_low?: number | null
          occurred_at?: string
          candle_index?: number
          confirmed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      order_blocks: {
        Row: {
          id: string
          pair: string
          timeframe: string
          block_type: 'bullish' | 'bearish'
          high: number
          low: number
          open: number
          close: number
          formed_at: string
          candle_index: number
          volume: number | null
          is_mitigated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: string
          timeframe: string
          block_type: 'bullish' | 'bearish'
          high: number
          low: number
          open: number
          close: number
          formed_at: string
          candle_index: number
          volume?: number | null
          is_mitigated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: string
          timeframe?: string
          block_type?: 'bullish' | 'bearish'
          high?: number
          low?: number
          open?: number
          close?: number
          formed_at?: string
          candle_index?: number
          volume?: number | null
          is_mitigated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      liquidity_zones: {
        Row: {
          id: string
          pair: string
          timeframe: string
          zone_type: 'buy_side' | 'sell_side'
          level: number
          formed_at: string
          swept: boolean
          swept_at: string | null
          touch_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: string
          timeframe: string
          zone_type: 'buy_side' | 'sell_side'
          level: number
          formed_at: string
          swept?: boolean
          swept_at?: string | null
          touch_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: string
          timeframe?: string
          zone_type?: 'buy_side' | 'sell_side'
          level?: number
          formed_at?: string
          swept?: boolean
          swept_at?: string | null
          touch_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      price_rejections: {
        Row: {
          id: string
          pair: string
          timeframe: string
          pattern: string
          occurred_at: string
          candle_index: number
          price_level: number
          rejection_strength: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: string
          timeframe: string
          pattern: string
          occurred_at: string
          candle_index: number
          price_level: number
          rejection_strength?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: string
          timeframe?: string
          pattern?: string
          occurred_at?: string
          candle_index?: number
          price_level?: number
          rejection_strength?: number
          created_at?: string
          updated_at?: string
        }
      }
      trade_signals: {
        Row: {
          id: string
          user_id: string | null
          pair: string
          side: 'buy' | 'sell'
          entry_price: number
          stop_loss: number
          take_profit: number
          stop_pips: number | null
          lot_size: number | null
          risk_usd: number | null
          reversal_pattern: string | null
          confidence_score: number | null
          confidence_label: 'high' | 'medium' | 'low' | null
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          htf_timeframe: string | null
          ltf_timeframe: string | null
          exit_price: number | null
          profit_loss: number | null
          profit_pips: number | null
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          pair: string
          side: 'buy' | 'sell'
          entry_price: number
          stop_loss: number
          take_profit: number
          stop_pips?: number | null
          lot_size?: number | null
          risk_usd?: number | null
          reversal_pattern?: string | null
          confidence_score?: number | null
          confidence_label?: 'high' | 'medium' | 'low' | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          htf_timeframe?: string | null
          ltf_timeframe?: string | null
          exit_price?: number | null
          profit_loss?: number | null
          profit_pips?: number | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          pair?: string
          side?: 'buy' | 'sell'
          entry_price?: number
          stop_loss?: number
          take_profit?: number
          stop_pips?: number | null
          lot_size?: number | null
          risk_usd?: number | null
          reversal_pattern?: string | null
          confidence_score?: number | null
          confidence_label?: 'high' | 'medium' | 'low' | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          htf_timeframe?: string | null
          ltf_timeframe?: string | null
          exit_price?: number | null
          profit_loss?: number | null
          profit_pips?: number | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_predictions: {
        Row: {
          id: string
          pair: string
          win_probability: number
          expected_rr: number
          confidence: 'high' | 'medium' | 'low'
          recommendation: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
          predicted_at: string
          model_version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: string
          win_probability: number
          expected_rr: number
          confidence: 'high' | 'medium' | 'low'
          recommendation: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
          predicted_at: string
          model_version?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: string
          win_probability?: number
          expected_rr?: number
          confidence?: 'high' | 'medium' | 'low'
          recommendation?: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
          predicted_at?: string
          model_version?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      technical_indicators: {
        Row: {
          id: string
          pair: string
          timeframe: string
          indicator_timestamp: string
          rsi_14: number | null
          macd_value: number | null
          macd_signal: number | null
          macd_histogram: number | null
          adx_14: number | null
          stochastic_k: number | null
          bb_upper: number | null
          bb_middle: number | null
          bb_lower: number | null
          atr_14: number | null
          ema_20: number | null
          ema_50: number | null
          ema_200: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: string
          timeframe: string
          indicator_timestamp: string
          rsi_14?: number | null
          macd_value?: number | null
          macd_signal?: number | null
          macd_histogram?: number | null
          adx_14?: number | null
          stochastic_k?: number | null
          bb_upper?: number | null
          bb_middle?: number | null
          bb_lower?: number | null
          atr_14?: number | null
          ema_20?: number | null
          ema_50?: number | null
          ema_200?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: string
          timeframe?: string
          indicator_timestamp?: string
          rsi_14?: number | null
          macd_value?: number | null
          macd_signal?: number | null
          macd_histogram?: number | null
          adx_14?: number | null
          stochastic_k?: number | null
          bb_upper?: number | null
          bb_middle?: number | null
          bb_lower?: number | null
          atr_14?: number | null
          ema_20?: number | null
          ema_50?: number | null
          ema_200?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      backtest_runs: {
        Row: {
          id: string
          user_id: string | null
          backtest_name: string
          start_date: string
          end_date: string
          pairs: string
          initial_capital: number
          risk_percent: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          backtest_name: string
          start_date: string
          end_date: string
          pairs: string
          initial_capital: number
          risk_percent: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          backtest_name?: string
          start_date?: string
          end_date?: string
          pairs?: string
          initial_capital?: number
          risk_percent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      backtest_trades: {
        Row: {
          id: string
          backtest_id: string
          pair: string
          side: 'buy' | 'sell'
          entry_time: string
          exit_time: string
          entry_price: number
          exit_price: number
          stop_loss: number
          take_profit: number
          lot_size: number
          profit_loss: number
          profit_loss_pips: number
          outcome: 'win' | 'loss' | 'breakeven'
          exit_reason: string | null
          confidence: string | null
          risk_reward: number | null
          created_at: string
        }
        Insert: {
          id?: string
          backtest_id: string
          pair: string
          side: 'buy' | 'sell'
          entry_time: string
          exit_time: string
          entry_price: number
          exit_price: number
          stop_loss: number
          take_profit: number
          lot_size: number
          profit_loss: number
          profit_loss_pips: number
          outcome: 'win' | 'loss' | 'breakeven'
          exit_reason?: string | null
          confidence?: string | null
          risk_reward?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          backtest_id?: string
          pair?: string
          side?: 'buy' | 'sell'
          entry_time?: string
          exit_time?: string
          entry_price?: number
          exit_price?: number
          stop_loss?: number
          take_profit?: number
          lot_size?: number
          profit_loss?: number
          profit_loss_pips?: number
          outcome?: 'win' | 'loss' | 'breakeven'
          exit_reason?: string | null
          confidence?: string | null
          risk_reward?: number | null
          created_at?: string
        }
      }
      backtest_results: {
        Row: {
          id: string
          backtest_id: string
          total_trades: number
          winning_trades: number
          losing_trades: number
          breakeven_trades: number
          win_rate: number
          total_profit: number
          total_loss: number
          net_profit: number
          max_drawdown: number
          max_drawdown_percent: number
          average_win: number
          average_loss: number
          profit_factor: number
          expectancy: number
          sharpe_ratio: number
          average_rr: number
          best_trade: number
          worst_trade: number
          average_trade_duration_hours: number
          created_at: string
        }
        Insert: {
          id?: string
          backtest_id: string
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          breakeven_trades?: number
          win_rate?: number
          total_profit?: number
          total_loss?: number
          net_profit?: number
          max_drawdown?: number
          max_drawdown_percent?: number
          average_win?: number
          average_loss?: number
          profit_factor?: number
          expectancy?: number
          sharpe_ratio?: number
          average_rr?: number
          best_trade?: number
          worst_trade?: number
          average_trade_duration_hours?: number
          created_at?: string
        }
        Update: {
          id?: string
          backtest_id?: string
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          breakeven_trades?: number
          win_rate?: number
          total_profit?: number
          total_loss?: number
          net_profit?: number
          max_drawdown?: number
          max_drawdown_percent?: number
          average_win?: number
          average_loss?: number
          profit_factor?: number
          expectancy?: number
          sharpe_ratio?: number
          average_rr?: number
          best_trade?: number
          worst_trade?: number
          average_trade_duration_hours?: number
          created_at?: string
        }
      }
      trade_journal: {
        Row: {
          id: string
          user_id: string
          signal_id: string | null
          entry_date: string
          pair: string
          side: 'buy' | 'sell'
          entry_price: number
          stop_loss: number
          take_profit: number
          setup_notes: string | null
          exit_price: number | null
          profit_loss: number | null
          outcome: 'win' | 'loss' | 'breakeven' | 'pending' | null
          trade_notes: string | null
          lessons_learned: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          signal_id?: string | null
          entry_date: string
          pair: string
          side: 'buy' | 'sell'
          entry_price: number
          stop_loss: number
          take_profit: number
          setup_notes?: string | null
          exit_price?: number | null
          profit_loss?: number | null
          outcome?: 'win' | 'loss' | 'breakeven' | 'pending' | null
          trade_notes?: string | null
          lessons_learned?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          signal_id?: string | null
          entry_date?: string
          pair?: string
          side?: 'buy' | 'sell'
          entry_price?: number
          stop_loss?: number
          take_profit?: number
          setup_notes?: string | null
          exit_price?: number | null
          profit_loss?: number | null
          outcome?: 'win' | 'loss' | 'breakeven' | 'pending' | null
          trade_notes?: string | null
          lessons_learned?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          log_timestamp: string
          event_type: string
          pair: string | null
          message: string
          details: string | null
          severity: 'info' | 'warning' | 'error'
        }
        Insert: {
          id?: string
          log_timestamp?: string
          event_type: string
          pair?: string | null
          message: string
          details?: string | null
          severity?: 'info' | 'warning' | 'error'
        }
        Update: {
          id?: string
          log_timestamp?: string
          event_type?: string
          pair?: string | null
          message?: string
          details?: string | null
          severity?: 'info' | 'warning' | 'error'
        }
      }
      alert_configurations: {
        Row: {
          id: string
          user_id: string
          alert_type: string
          pair: string | null
          enabled: boolean
          notification_method: 'email' | 'in_app' | 'webhook'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_type: string
          pair?: string | null
          enabled?: boolean
          notification_method?: 'email' | 'in_app' | 'webhook'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_type?: string
          pair?: string | null
          enabled?: boolean
          notification_method?: 'email' | 'in_app' | 'webhook'
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          alert_id: string | null
          signal_id: string | null
          title: string
          message: string
          notification_method: string
          sent_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          alert_id?: string | null
          signal_id?: string | null
          title: string
          message: string
          notification_method: string
          sent_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          alert_id?: string | null
          signal_id?: string | null
          title?: string
          message?: string
          notification_method?: string
          sent_at?: string
          read_at?: string | null
        }
      }
      ohlc_candles: {
        Row: {
          id: string
          pair: string
          timeframe: string
          candle_timestamp: string
          open: number
          high: number
          low: number
          close: number
          volume: number | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          pair: string
          timeframe: string
          candle_timestamp: string
          open: number
          high: number
          low: number
          close: number
          volume?: number | null
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          pair?: string
          timeframe?: string
          candle_timestamp?: string
          open?: number
          high?: number
          low?: number
          close?: number
          volume?: number | null
          source?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
