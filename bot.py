#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onion AI Bot - Telegram Bot
Responds to /start command with the website link
Logs all /start commands to a file
"""

import asyncio
import logging
import json
from datetime import datetime
from pathlib import Path
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

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # Keep our own logs at INFO level

# Bot start logging setup
BOT_STATS_DIR = Path('bot_stats')
BOT_STATS_DIR.mkdir(exist_ok=True)
BOT_STARTS_FILE = BOT_STATS_DIR / 'starts.jsonl'
BOT_STATS_FILE = BOT_STATS_DIR / 'country_stats.json'

# Mapping language codes to countries (fallback)
LANGUAGE_TO_COUNTRY = {
    'it': 'Italy', 'en': 'United States', 'es': 'Spain', 'fr': 'France',
    'de': 'Germany', 'pt': 'Portugal', 'ru': 'Russia', 'zh': 'China',
    'ja': 'Japan', 'ko': 'South Korea', 'ar': 'Saudi Arabia', 'tr': 'Turkey',
    'pl': 'Poland', 'nl': 'Netherlands', 'uk': 'Ukraine', 'ro': 'Romania',
    'cs': 'Czech Republic', 'hu': 'Hungary', 'sv': 'Sweden', 'no': 'Norway',
    'da': 'Denmark', 'fi': 'Finland', 'el': 'Greece', 'he': 'Israel',
    'th': 'Thailand', 'vi': 'Vietnam', 'id': 'Indonesia', 'ms': 'Malaysia',
    'hi': 'India', 'bn': 'Bangladesh', 'ur': 'Pakistan', 'fa': 'Iran'
}


def get_country_from_language(language_code):
    """Get country name from language code"""
    if not language_code:
        return 'Unknown'
    
    # Get base language code (e.g., 'it' from 'it-IT')
    base_lang = language_code.split('-')[0].lower()
    return LANGUAGE_TO_COUNTRY.get(base_lang, 'Unknown')


def update_country_stats(country):
    """Update country statistics"""
    try:
        # Load existing stats
        if BOT_STATS_FILE.exists():
            with open(BOT_STATS_FILE, 'r', encoding='utf-8') as f:
                stats = json.load(f)
        else:
            stats = {
                'total_starts': 0,
                'countries': {},
                'last_updated': None
            }
        
        # Update stats
        stats['total_starts'] = stats.get('total_starts', 0) + 1
        stats['countries'][country] = stats['countries'].get(country, 0) + 1
        stats['last_updated'] = datetime.now().isoformat()
        
        # Save updated stats
        with open(BOT_STATS_FILE, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        
        # Log country stats
        country_count = stats['countries'][country]
        logger.info(f"📊 Stats updated: {country} ({country_count} starts, Total: {stats['total_starts']})")
        
        return stats
    except Exception as e:
        logger.error(f"Error updating country stats: {e}")
        return None


def log_bot_start(update: Update):
    """Log when someone uses /start command"""
    try:
        user = update.effective_user
        chat = update.effective_chat
        
        # Get country from language code
        language_code = user.language_code if user else None
        country = get_country_from_language(language_code)
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'user_id': user.id if user else None,
            'username': user.username if user else None,
            'first_name': user.first_name if user else None,
            'last_name': user.last_name if user else None,
            'chat_id': chat.id if chat else None,
            'chat_type': chat.type if chat else None,
            'language_code': language_code,
            'country': country
        }
        
        # Log to file
        with open(BOT_STARTS_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(data, ensure_ascii=False) + '\n')
        
        # Update country statistics
        update_country_stats(country)
        
        username = user.username if user and user.username else (user.first_name if user else 'Unknown')
        logger.info(f"Bot /start used by: {username} (ID: {user.id if user else 'N/A'}) from {country}")
        return True
    except Exception as e:
        logger.error(f"Error logging bot start: {e}")
        return False


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles the /start command"""
    # Log the /start command
    log_bot_start(update)
    
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
    """Starts the bot"""
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
    logger.info(f"Bot starts will be logged to: {BOT_STARTS_FILE.absolute()}")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()

