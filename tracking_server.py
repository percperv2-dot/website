#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tracking Server - Receives and logs website visitor data
Run this alongside the bot to track website visitors
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from your website

# Directory for storing tracking data
TRACKING_DIR = Path('tracking_data')
TRACKING_DIR.mkdir(exist_ok=True)

# Log file path
LOG_FILE = TRACKING_DIR / 'visitors.jsonl'  # JSON Lines format


def log_visit(data):
    """Log visitor data to file"""
    try:
        # Add server timestamp
        data['server_timestamp'] = datetime.now().isoformat()
        
        # Write to JSON Lines file (one JSON object per line)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(data, ensure_ascii=False) + '\n')
        
        print(f"✓ Visit logged: {data.get('referrer', 'direct')} -> {data.get('url', 'N/A')}")
        return True
    except Exception as e:
        print(f"✗ Error logging visit: {e}")
        return False


@app.route('/track', methods=['POST', 'OPTIONS'])
def track():
    """Endpoint to receive tracking data"""
    if request.method == 'OPTIONS':
        # Handle CORS preflight
        return '', 200
    
    try:
        data = request.get_json()
        if data:
            log_visit(data)
            return jsonify({'status': 'success'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'No data received'}), 400
    except Exception as e:
        print(f"Error processing tracking data: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/stats', methods=['GET'])
def stats():
    """Get basic statistics about visitors"""
    try:
        if not LOG_FILE.exists():
            return jsonify({
                'total_visits': 0,
                'message': 'No tracking data yet'
            })
        
        visits = []
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    visits.append(json.loads(line))
        
        # Count by referrer
        referrers = {}
        for visit in visits:
            ref = visit.get('referrer', 'direct')
            referrers[ref] = referrers.get(ref, 0) + 1
        
        return jsonify({
            'total_visits': len(visits),
            'referrers': referrers,
            'last_visit': visits[-1] if visits else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/visits', methods=['GET'])
def visits():
    """Get all visits (limited to last 100)"""
    try:
        if not LOG_FILE.exists():
            return jsonify({'visits': []})
        
        visits = []
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            # Get last 100 visits
            for line in lines[-100:]:
                if line.strip():
                    visits.append(json.loads(line))
        
        return jsonify({'visits': visits})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("Tracking Server Starting...")
    print(f"Log file: {LOG_FILE.absolute()}")
    print("=" * 50)
    print("\nEndpoints:")
    print("  POST /track - Receive tracking data")
    print("  GET  /stats - Get visitor statistics")
    print("  GET  /visits - Get recent visits")
    print("\nServer running on http://localhost:8080")
    print("Press Ctrl+C to stop\n")
    
    app.run(host='0.0.0.0', port=8080, debug=False)

