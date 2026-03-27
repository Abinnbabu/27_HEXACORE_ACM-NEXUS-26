"""
Resolve coordinates to a human-readable place and an embeddable OSM map URL.

The frontend sends latitude/longitude from the browser Geolocation API (or manual
entry later). This module calls Nominatim for reverse geocoding — use sparingly
in production and respect https://operations.osmfoundation.org/policies/nominatim/
(rate limits, attribution).
"""

from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse"
USER_AGENT = "ClimateAi/1.0 (local development; contact: dev@localhost)"


def _parse_coord(value: str | float | None, name: str) -> float:
    if value is None or value == "":
        raise ValueError(f"Missing {name}")
    return float(value)


def _reverse_geocode(lat: float, lon: float) -> dict:
    params = urllib.parse.urlencode(
        {
            "lat": lat,
            "lon": lon,
            "format": "json",
            "accept-language": "en",
        }
    )
    url = f"{NOMINATIM_REVERSE}?{params}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        return json.loads(resp.read().decode())


def _build_osm_embed_url(lat: float, lon: float, span: float = 0.02) -> str:
    """BBox around the point; marker uses lat/lon format expected by OSM embed."""
    min_lon = lon - span
    min_lat = lat - span * 0.75
    max_lon = lon + span
    max_lat = lat + span * 0.75
    q = urllib.parse.urlencode(
        {
            "bbox": f"{min_lon},{min_lat},{max_lon},{max_lat}",
            "layer": "mapnik",
            "marker": f"{lat}/{lon}",
        }
    )
    return f"https://www.openstreetmap.org/export/embed.html?{q}"


@api_view(["GET"])
def location_map(request):
    """
    GET /api/location/?latitude=<float>&longitude=<float>

    Returns display_name, coordinates, and map_embed_url for an <iframe>.
    """
    try:
        lat = _parse_coord(request.query_params.get("latitude"), "latitude")
        lon = _parse_coord(request.query_params.get("longitude"), "longitude")
    except (TypeError, ValueError):
        return Response(
            {"detail": "Provide valid numeric latitude and longitude query parameters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
        return Response(
            {"detail": "latitude must be [-90, 90] and longitude [-180, 180]."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payload = _reverse_geocode(lat, lon)
    except urllib.error.HTTPError as e:
        return Response(
            {"detail": f"Geocoding service error: {e.code}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except urllib.error.URLError as e:
        return Response(
            {"detail": f"Geocoding unreachable: {e.reason!s}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except (json.JSONDecodeError, ValueError) as e:
        return Response(
            {"detail": f"Invalid geocoding response: {e!s}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    display = payload.get("display_name") or payload.get("name") or f"{lat:.5f}, {lon:.5f}"
    map_url = _build_osm_embed_url(lat, lon)

    return Response(
        {
            "latitude": lat,
            "longitude": lon,
            "display_name": display,
            "map_embed_url": map_url,
            "osm_attribution": "© OpenStreetMap contributors",
        }
    )
