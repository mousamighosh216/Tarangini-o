# Central logging configuration
# Log format
# Log levels
# File + console handlers

# logging.py
import logging
from logging.handlers import RotatingFileHandler
import sys
from config import settings

# -----------------------
# Log format
# -----------------------
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# -----------------------
# Central logger setup
# -----------------------
def setup_logger(name: str, log_file: str = "app.log", level: int = logging.INFO) -> logging.Logger:
    """Create a logger with both console and rotating file handlers"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    formatter = logging.Formatter(LOG_FORMAT)

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(level)
    ch.setFormatter(formatter)
    logger.addHandler(ch)

    # Rotating file handler (max 5 MB per file, keep 3 backups)
    fh = RotatingFileHandler(log_file, maxBytes=5*1024*1024, backupCount=3)
    fh.setLevel(level)
    fh.setFormatter(formatter)
    logger.addHandler(fh)

    return logger

# -----------------------
# Example usage
# -----------------------
logger = setup_logger(settings.PROJECT_NAME)
logger.info("Logger initialized successfully")