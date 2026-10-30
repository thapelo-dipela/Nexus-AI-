"""
NEXUS Dashboard API Server
Serves real-time market data and bot performance metrics to the HTML dashboard
"""
import os
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from flask import Flask, jsonify, render_template, send_file
import logging

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

import config
from data.prism import PrismClient
from execution.kraken import KrakenClient
from agents.sentiment import fetch_composite_sentiment

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask
app = Flask(__name__)


# Initialize PRISM client
try:
    prism_client = PrismClient(config.PRISM_API_KEY, KrakenClient(dry_run=True))
    logger.info("✅ PRISM client initialized")
except Exception as e:
    logger.error(f"❌ Failed to initialize PRISM client: {e}")
    prism_client = None

# ============================================================================
# Data Loading Functions
# ============================================================================

def load_records(filename):
    """Read state relative to the project, returning empty only when absent."""
    path = Path(__file__).resolve().parent / filename
    try:
        with path.open(encoding='utf-8') as handle:
            records = json.load(handle)
        if not isinstance(records, list):
            raise ValueError(f"Expected a list in {filename}")
        return records
    except FileNotFoundError:
        return []


def load_agent_weights():
    return load_records(config.WEIGHTS_FILE)


def load_positions():
    return [p for p in load_records(config.POSITIONS_FILE) if p.get('status') == 'open']


def load_equity_curve():
    return load_records(config.EQUITY_CURVE_FILE)


def portfolio_performance():
    """Count each closed position once, rather than summing agent attribution."""
    closed = [p for p in load_records(config.POSITIONS_FILE) if p.get('status') == 'closed']
    wins = sum(p.get('pnl_usd', 0) > 0 for p in closed)
    losses = sum(p.get('pnl_usd', 0) < 0 for p in closed)
    pnl = sum(p.get('pnl_usd', 0) for p in closed)
    peak = 0
    drawdown = 0
    for point in load_equity_curve():
        equity = point['equity']
        peak = max(peak, equity)
        if peak > 0:
            drawdown = max(drawdown, (peak - equity) / peak * 100)
    return {
        'total_trades': len(closed), 'wins': wins, 'losses': losses,
        'win_rate': wins / len(closed) * 100 if closed else 0,
        'total_pnl': pnl, 'avg_pnl': pnl / len(closed) if closed else 0,
        'max_drawdown': drawdown, 'open_positions': len(load_positions()),
    }

# ============================================================================
# API Endpoints
# ============================================================================

@app.route('/')
def dashboard():
    """Serve the dashboard HTML"""
    return send_file(Path(__file__).resolve().parent / 'dashboard.html')

@app.route('/api/market', methods=['GET'])
def get_market_data():
    """Get current market data"""
    try:
        if prism_client:
            # Get price from PRISM
            price_data = prism_client.get_price('BTC')
            if not price_data or price_data.get('price', 0) <= 0:
                return jsonify({'success': False, 'error': 'Market data unavailable'}), 503
            
            # Get signals
            signals_1h = prism_client.get_signals('BTC', '1h')
            signals_4h = prism_client.get_signals('BTC', '4h')
            
            # Get risk
            risk = prism_client.get_risk('BTC')
            
            return jsonify({
                'success': True,
                'price': price_data['price'],
                'change_24h': None,  # PRISM price adapter does not supply this metric
                'volume_24h': None,
                'signal_1h': signals_1h.direction if signals_1h else 'neutral',
                'signal_4h': signals_4h.direction if signals_4h else 'neutral',
                'risk_score': risk.risk_score if risk else None,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'PRISM client not available'
            }), 503
    except Exception as e:
        logger.error(f"Error fetching market data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/agents', methods=['GET'])
def get_agents():
    """Get agent performance metrics"""
    try:
        agents = load_agent_weights()
        
        # Calculate aggregated metrics
        total_trades = sum(a.get('trades_closed', 0) for a in agents)
        total_wins = sum(a.get('wins', 0) for a in agents)
        total_pnl = sum(a.get('pnl_total', 0) for a in agents)
        
        return jsonify({
            'success': True,
            'agents': agents,
            'summary': {
                'total_trades': total_trades,
                'total_wins': total_wins,
                'win_rate': (total_wins / total_trades * 100) if total_trades > 0 else 0,
                'total_pnl': total_pnl,
                'avg_pnl_per_trade': (total_pnl / total_trades) if total_trades > 0 else 0,
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error fetching agent data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sentiment', methods=['GET'])
def get_sentiment():
    """Get sentiment analysis"""
    try:
        import requests
        
        sentiment_data = {
            'timestamp': datetime.now().isoformat()
        }
        
        # Fear & Greed Index
        try:
            fng_response = requests.get('https://api.alternative.me/fng/?limit=1', timeout=5)
            fng_data = fng_response.json()
            if fng_data.get('data'):
                sentiment_data['fear_greed'] = int(fng_data['data'][0]['value'])
        except Exception as e:
            logger.warning(f"Failed to fetch Fear & Greed: {e}")
        
        # Composite sentiment
        try:
            composite = fetch_composite_sentiment()
            sentiment_data['composite'] = composite
        except Exception as e:
            logger.warning(f"Failed to fetch composite sentiment: {e}")
        
        return jsonify({
            'success': True,
            **sentiment_data
        })
    except Exception as e:
        logger.error(f"Error fetching sentiment data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/positions', methods=['GET'])
def get_positions():
    """Get current open positions"""
    try:
        positions = load_positions()
        return jsonify({
            'success': True,
            'positions': positions,
            'count': len(positions),
            'total_exposure': sum(p.get('entry_price', 0) * p.get('volume', 0) for p in positions),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error fetching positions: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/equity', methods=['GET'])
def get_equity():
    """Get equity curve"""
    try:
        equity_data = load_equity_curve()
        return jsonify({
            'success': True,
            'data': equity_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error fetching equity data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/risk', methods=['GET'])
def get_risk():
    """Get risk metrics"""
    try:
        if prism_client:
            risk = prism_client.get_risk('BTC')
            if risk:
                return jsonify({
                    'success': True,
                    'risk_score': risk.risk_score,
                    'atr_pct': risk.atr_pct,
                    'volatility_30d': risk.volatility_30d,
                    'max_drawdown_30d': risk.max_drawdown_30d,
                    'sharpe_ratio': risk.sharpe_ratio,
                    'sortino_ratio': risk.sortino_ratio,
                    'timestamp': datetime.now().isoformat()
                })
        
        return jsonify({'success': False, 'error': 'Risk data unavailable'}), 503
    except Exception as e:
        logger.error(f"Error fetching risk data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/performance', methods=['GET'])
def get_performance():
    """Get comprehensive performance metrics"""
    try:
        return jsonify({'success': True, 'performance': portfolio_performance(),
                        'timestamp': datetime.now().isoformat()})
    except Exception as e:
        logger.error(f"Error fetching performance data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'prism_configured': bool(config.PRISM_API_KEY),
    })

# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    logger.info("🚀 Starting NEXUS Dashboard API Server")
    logger.info("📊 Dashboard available at http://localhost:5000")
    logger.info("📡 API endpoints:")
    logger.info("   - GET  /api/market      → Market data")
    logger.info("   - GET  /api/agents      → Agent performance")
    logger.info("   - GET  /api/sentiment   → Sentiment analysis")
    logger.info("   - GET  /api/positions   → Current positions")
    logger.info("   - GET  /api/equity      → Equity curve")
    logger.info("   - GET  /api/risk        → Risk metrics")
    logger.info("   - GET  /api/performance → Overall performance")
    logger.info("   - GET  /api/health      → Health check")
    
    app.run(host='127.0.0.1', port=5000, debug=False)
