# Celery is optional for this project (see requirements.txt). The core
# payment-verification flow calls payments/blockchain.py directly and does
# not require a task queue, so we don't import Celery here unconditionally -
# that would crash startup on machines that skipped the optional
# celery/redis install.
#
# If you do want Celery, install celery+redis and uncomment:
# from .celery import app as celery_app
# __all__ = ('celery_app',)
