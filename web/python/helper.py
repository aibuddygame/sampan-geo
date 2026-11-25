import ipaddress
import re
import socket
from urllib.parse import urlparse


def strip_think_blocks(text: str | None) -> str:
    if not text:
        return ""
    return re.sub(r"<think>.*?</think>\s*", "", text, flags=re.DOTALL).strip()


def normalize_domain(url_or_domain: str | None) -> str | None:
    if not url_or_domain:
        return None
    raw = url_or_domain.strip().lower()
    if "://" not in raw:
        raw = "https://" + raw
    host = urlparse(raw).hostname or ""
    return host.removeprefix("www.") or None


def is_target_match(url: str | None, target_domain: str | None) -> bool:
    if not url or not target_domain:
        return False
    url_domain = normalize_domain(url)
    if not url_domain:
        return False
    return url_domain == target_domain or url_domain.endswith("." + target_domain)


def validate_public_http_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("Only http and https URLs with a valid hostname are allowed.")

    host = parsed.hostname
    try:
        infos = socket.getaddrinfo(host, None)
        for info in infos:
            ip_str = info[4][0]
            ip_obj = ipaddress.ip_address(ip_str)
            if (
                ip_obj.is_private
                or ip_obj.is_loopback
                or ip_obj.is_link_local
                or ip_obj.is_reserved
                or ip_obj.is_multicast
            ):
                raise ValueError(f"Blocked non-public IP address for host: {host}")
    except socket.gaierror as exc:
        raise ValueError(f"Could not resolve hostname: {host}") from exc

    return url
