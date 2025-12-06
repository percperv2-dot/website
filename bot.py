#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onion AI Bot - Telegram Bot with Website Tracking
Responds to /start command with the website link
Also runs a tracking server to monitor website visitors
"""

import asyncio
import logging
import threading
import json
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Token del bot Telegram
BOT_TOKEN = "8545357233:AAEc1Iep-5id9hUEAzuQWVbRfnvbCO-MMZI"

# Configure logging - reduce verbosity
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.WARNING  # Only show warnings and errors
)

# Disable verbose logging from httpx and telegram.ext
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("telegram.ext").setLevel(logging.WARNING)
logging.getLogger("telegram").setLevel(logging.WARNING)
logging.getLogger("werkzeug").setLevel(logging.WARNING)  # Flask logs

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # Keep our own logs at INFO level

# Tracking server setup
TRACKING_DIR = Path('tracking_data')
TRACKING_DIR.mkdir(exist_ok=True)
LOG_FILE = TRACKING_DIR / 'visitors.jsonl'

# Flask app for tracking
tracking_app = Flask(__name__)
CORS(tracking_app)


# Tracking server functions
def log_visit(data):
    """Log visitor data to file"""
    try:
        data['server_timestamp'] = datetime.now().isoformat()
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(data, ensure_ascii=False) + '\n')
        logger.info(f"Visit logged: {data.get('referrer', 'direct')} -> {data.get('url', 'N/A')}")
        return True
    except Exception as e:
        logger.error(f"Error logging visit: {e}")
        return False


@tracking_app.route('/track', methods=['POST', 'OPTIONS'])
def track():
    """Endpoint to receive tracking data"""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        if data:
            log_visit(data)
            return jsonify({'status': 'success'}), 200
        return jsonify({'status': 'error', 'message': 'No data received'}), 400
    except Exception as e:
        logger.error(f"Error processing tracking data: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@tracking_app.route('/stats', methods=['GET'])
def stats():
    """Get basic statistics about visitors"""
    try:
        if not LOG_FILE.exists():
            return jsonify({'total_visits': 0, 'message': 'No tracking data yet'})
        visits = []
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    visits.append(json.loads(line))
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


@tracking_app.route('/visits', methods=['GET'])
def visits():
    """Get all visits (limited to last 100)"""
    try:
        if not LOG_FILE.exists():
            return jsonify({'visits': []})
        visits_list = []
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines[-100:]:
                if line.strip():
                    visits_list.append(json.loads(line))
        return jsonify({'visits': visits_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def run_tracking_server():
    """Run Flask tracking server in a separate thread"""
    tracking_app.run(host='0.0.0.0', port=8080, debug=False, use_reloader=False)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles the /start command"""
    message = "Welcome to Onion AI Bot!\n\n"
    message += "Visit our website: www.oaibot.net"
    
    await update.message.reply_text(message)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles the /help command"""
    message = "Available commands:\n"
    message += "/start - Start using the bot\n"
    message += "/help - Show this help message\n\n"
    message += "Visit our website: www.oaibot.net"
    
    await update.message.reply_text(message)


def main() -> None:
    """Starts the bot and tracking server"""
    # Start tracking server in a separate thread
    tracking_thread = threading.Thread(target=run_tracking_server, daemon=True)
    tracking_thread.start()
    logger.info("Tracking server started on http://localhost:8080")
    
    # Create the application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    # Create event loop for Python 3.14 compatibility
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    # Start the bot
    logger.info("Bot started! Press Ctrl+C to stop.")
    logger.info("Tracking endpoints:")
    logger.info("  - POST http://localhost:8080/track")
    logger.info("  - GET  http://localhost:8080/stats")
    logger.info("  - GET  http://localhost:8080/visits")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()

