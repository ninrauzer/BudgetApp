"""
Exchange Rate API router
"""
from fastapi import APIRouter, Query, Depends
from datetime import date
from typing import Optional

from app.services.exchange_rate import get_exchange_rate
from app.oauth import get_current_user
from app.models.user import User

router = APIRouter(tags=["exchange-rate"])


@router.get("/exchange-rate")
async def get_current_exchange_rate(
    date_param: Optional[str] = Query(None, alias="date"),
    current_user: User = Depends(get_current_user)
):
    """
    Get USD/PEN exchange rate from BCRP for a specific date.
    
    - **date**: Date in ISO format (YYYY-MM-DD). If not provided, uses today.
    
    Returns the exchange rate and source information.
    """
    target_date = None
    if date_param:
        try:
            target_date = date.fromisoformat(date_param)
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD"}
    
    rate = await get_exchange_rate(target_date)
    
    return {
        "rate": rate,
        "currency_pair": "USD/PEN",
        "date": (target_date or date.today()).isoformat(),
        "source": "BCRP"
    }
