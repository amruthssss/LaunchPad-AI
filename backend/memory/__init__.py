"""Memory adapters used by LaunchPad AI.

The app currently accesses the optional Redis/in-memory adapter through
``memory.redis_client``. Keep package initialization free of eager adapter
imports so a missing optional implementation cannot prevent API startup.
"""
