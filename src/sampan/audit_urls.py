"""Unicode content paths for the audit only; strict T001 URL policy is unchanged."""
from urllib.parse import quote, urlsplit, urlunsplit
from sampan.intake import normalize_url, IntakeBlocked


def normalize_audit_url(value, *, host):
    if not isinstance(value,str) or len(value)>2048:
        raise IntakeBlocked('invalid URL')
    if any(ord(c)<=32 or ord(c)==127 for c in value) or '\\' in value:
        raise IntakeBlocked('ambiguous URL encoding')
    try:
        parsed=urlsplit(value)
        # Never transform or infer an authority. Encode only resource paths and
        # queries; the existing strict origin, port, percent and control guards
        # then validate the final ASCII URL, including its expanded length.
        if not parsed.netloc.isascii():raise IntakeBlocked('ambiguous authority')
        encoded=urlunsplit((parsed.scheme,parsed.netloc,
            quote(parsed.path,safe="/%:@!$&'()*+,;=-._~"),
            quote(parsed.query,safe="/%?:@!$&'()*+,;=-._~"),''))
        return normalize_url(encoded,host=host)
    except ValueError as exc:
        raise IntakeBlocked('invalid URL') from exc
