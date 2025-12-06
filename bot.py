#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onion AI Bot - Telegram Bot
Responds to /start command with the website link
"""

import logging
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
    """Starts the bot"""
    # Create the application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    # Start the bot
    logger.info("Bot started! Press Ctrl+C to stop.")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()

