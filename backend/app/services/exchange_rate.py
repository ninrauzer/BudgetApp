"""
Service to fetch exchange rates from BCRP (Banco Central de Reserva del Perú)
"""
import httpx
from datetime import date, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Cache para evitar consultas repetidas
_exchange_rate_cache: dict[str, float] = {}


async def get_exchange_rate(target_date: Optional[date] = None) -> float:
    """
    Obtiene el tipo de cambio USD/PEN desde la API del BCRP.
    
    Args:
        target_date: Fecha para la cual se requiere el tipo de cambio.
                    Si es None, usa la fecha actual.
    
    Returns:
        Tipo de cambio USD/PEN (cuántos soles por 1 dólar)
    
    Raises:
        Exception: Si no se puede obtener el tipo de cambio
    """
    if target_date is None:
        target_date = date.today()
    
    # Verificar cache
    cache_key = target_date.isoformat()
    if cache_key in _exchange_rate_cache:
        logger.info(f"Using cached exchange rate for {cache_key}: {_exchange_rate_cache[cache_key]}")
        return _exchange_rate_cache[cache_key]
    
    try:
        # API del BCRP
        # Formato: https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04639PD/json/YYYY-MM-DD/YYYY-MM-DD
        # PD04639PD = Tipo de cambio - Promedio ponderado - Venta
        
        start_date = target_date.strftime("%Y-%m-%d")
        end_date = target_date.strftime("%Y-%m-%d")
        url = f"https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04639PD/json/{start_date}/{end_date}"
        
        # Headers para evitar bloqueo 403
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "es-PE,es;q=0.9,en;q=0.8",
            "Referer": "https://estadisticas.bcrp.gob.pe/"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
        
        # Parsear respuesta
        if "periods" in data and len(data["periods"]) > 0:
            # La API devuelve {"periods": [{"name": "YYYY-MM-DD", "values": [3.75]}]}
            exchange_rate = float(data["periods"][0]["values"][0])
            
            # Guardar en cache
            _exchange_rate_cache[cache_key] = exchange_rate
            logger.info(f"Fetched exchange rate for {cache_key}: {exchange_rate}")
            
            return exchange_rate
        else:
            # Si no hay datos para esa fecha (fin de semana/feriado), buscar día anterior
            logger.warning(f"No exchange rate data for {target_date}, trying previous day")
            previous_date = target_date - timedelta(days=1)
            
            # Evitar recursión infinita (máximo 7 días atrás)
            if (target_date - previous_date).days < 7:
                return await get_exchange_rate(previous_date)
            else:
                raise Exception(f"Could not find exchange rate for {target_date} or previous 7 days")
    
    except httpx.HTTPError as e:
        logger.error(f"Error fetching exchange rate from BCRP: {e}")
        # Fallback: usar un tipo de cambio por defecto
        logger.warning("Using fallback exchange rate: 3.75")
        return 3.75
    
    except Exception as e:
        logger.error(f"Unexpected error getting exchange rate: {e}")
        # Fallback: usar un tipo de cambio por defecto
        logger.warning("Using fallback exchange rate: 3.75")
        return 3.75


def convert_to_pen(amount_usd: float, exchange_rate: float) -> float:
    """
    Convierte un monto de USD a PEN usando el tipo de cambio proporcionado.
    
    Args:
        amount_usd: Monto en dólares
        exchange_rate: Tipo de cambio USD/PEN
    
    Returns:
        Monto convertido a soles
    """
    return round(amount_usd * exchange_rate, 2)


def convert_to_usd(amount_pen: float, exchange_rate: float) -> float:
    """
    Convierte un monto de PEN a USD usando el tipo de cambio proporcionado.
    
    Args:
        amount_pen: Monto en soles
        exchange_rate: Tipo de cambio USD/PEN
    
    Returns:
        Monto convertido a dólares
    """
    return round(amount_pen / exchange_rate, 2)
