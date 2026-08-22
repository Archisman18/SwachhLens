"""
Notification service — fires when a complaint's status changes.

This is a thin abstraction layer so the actual delivery channel
(SMS / WhatsApp / email / push) can be swapped in later. For now
it logs the notification to the console.

To add a real channel, implement a `_send_*` function and call it
from `notify_status_change`.
"""

import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Valid status transitions (for reference / future validation)
_STATUS_FLOW = {
    "reported": "assigned",
    "assigned": "cleaned",
    "cleaned": "verified",
}


async def notify_status_change(
    complaint_id: str,
    old_status: str,
    new_status: str,
    latitude: float | None = None,
    longitude: float | None = None,
) -> None:
    """
    Fire a notification when a complaint's status changes.

    This function is designed to never raise — if the notification
    channel fails, it logs a warning and returns silently so the
    status update is not blocked.
    """
    try:
        now = datetime.now(timezone.utc).isoformat()

        # Build a human-readable message
        messages = {
            "assigned": (
                "Good news! Your waste report has been assigned to a cleanup crew. "
                "A team is on its way."
            ),
            "cleaned": (
                "The area you reported has been cleaned by our sanitation team. "
                "Thank you for helping keep your neighbourhood clean!"
            ),
            "verified": (
                "The cleanup has been verified with photo proof. "
                "Your report is now fully resolved. Thank you!"
            ),
            "duplicate": (
                "Your report has been merged with an existing active complaint "
                "at this location. It is already being addressed."
            ),
        }

        message = messages.get(
            new_status,
            f"Your report status has been updated to: {new_status}.",
        )

        # ── Log the notification (stub channel) ──────────────────────
        logger.info(
            "[NOTIFICATION] complaint=%s | %s -> %s | %s | message=%s",
            complaint_id,
            old_status,
            new_status,
            now,
            message,
        )

        # ── Future: real channels go here ────────────────────────────
        # await _send_sms(phone_number, message)
        # await _send_email(email, subject, message)
        # await _send_whatsapp(phone_number, message)
        # await _send_push_notification(device_token, message)

    except Exception as exc:
        logger.warning(
            "Notification failed for complaint %s (%s -> %s): %s",
            complaint_id, old_status, new_status, exc,
        )
