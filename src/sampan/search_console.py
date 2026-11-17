"""Local, read-only Search Console pilot CLI. No public OAuth or client-site writes."""
import argparse
from datetime import date, datetime, timezone
import json
import math
import os
from pathlib import Path
import secrets
import sys
from urllib.parse import quote, urlsplit

import httpx

SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
TOKEN_URL = 'https://oauth2.googleapis.com/token'
API = 'https://www.googleapis.com/webmasters/v3/sites'
ROOT = Path('private/google')
PROPERTIES = ('sc-domain:marksix.gold', 'https://marksix.gold/', 'https://www.marksix.gold/')
MAX_BYTES = 2_000_000


class SearchConsoleError(ValueError):
    """Safe error message; never includes provider bodies or credentials."""


def read_private(path):
    path = Path(path)
    if path.is_symlink() or path.parent.is_symlink() or not path.is_file():
        raise SearchConsoleError('Private Google configuration is missing or unsafe.')
    if path.stat().st_mode & 0o077:
        raise SearchConsoleError('Restrict Google credential permissions to 0600 before use.')
    if path.stat().st_size > MAX_BYTES:
        raise SearchConsoleError('Private Google file exceeds the size limit.')
    try:
        row = json.loads(path.read_bytes())
        if not isinstance(row, dict):
            raise ValueError()
        return row
    except (ValueError, OSError):
        raise SearchConsoleError('Private Google file is unreadable.') from None


def write_private(path, row, replace=False):
    path = Path(path)
    if path.parent.is_symlink() or path.is_symlink():
        raise SearchConsoleError('Private Google storage is unsafe.')
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    raw = json.dumps(row, ensure_ascii=False, indent=2).encode()
    if len(raw) > MAX_BYTES:
        raise SearchConsoleError('Google record exceeds the size limit.')
    if not replace:
        with os.fdopen(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'wb') as f:
            f.write(raw)
        return
    temporary = path.with_name('.' + secrets.token_hex(12) + '.tmp')
    try:
        write_private(temporary, row)
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def client_config(root=ROOT):
    data = read_private(root / 'client_secret.json')
    installed = data.get('installed')
    if not isinstance(installed, dict) or not installed.get('client_id') or not installed.get('client_secret'):
        raise SearchConsoleError('A Google Desktop app OAuth client JSON is required.')
    if installed.get('token_uri') != TOKEN_URL or installed.get('auth_uri') not in {
        'https://accounts.google.com/o/oauth2/auth', 'https://accounts.google.com/o/oauth2/v2/auth'
    }:
        raise SearchConsoleError('Unexpected Google OAuth endpoints; configuration rejected.')
    return {'installed': installed}


def authorize(root=ROOT):
    config = client_config(root)
    if (root / 'token.json').exists():
        raise SearchConsoleError('Local Google authorization already exists; retain it or explicitly archive it before reauthorizing.')
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        raise SearchConsoleError('Install the optional google dependency first.') from None
    flow = InstalledAppFlow.from_client_config(config, scopes=[SCOPE], autogenerate_code_verifier=True)
    # Google helper validates OAuth state and PKCE. User completes consent in the system browser.
    try:
        credentials = flow.run_local_server(
            host='127.0.0.1', bind_addr='127.0.0.1', port=0, open_browser=True,
            authorization_prompt_message='', success_message='SAMPAN authorization received. You can close this tab.',
            timeout_seconds=180, access_type='offline', prompt='consent', include_granted_scopes='false')
        granted = credentials.granted_scopes or credentials.scopes
        if set(granted or []) != {SCOPE} or not credentials.refresh_token:
            raise SearchConsoleError('Read-only offline authorization was not granted; no token saved.')
        write_private(root / 'token.json', {
            'refresh_token': credentials.refresh_token, 'scopes': [SCOPE],
            'authorized_at': datetime.now(timezone.utc).isoformat(),
            'client_id': config['installed']['client_id'],
        })
    except SearchConsoleError:
        raise
    except Exception:
        raise SearchConsoleError('Google authorization did not complete; no token saved. Check consent, test-user setup and retry manually.') from None


def request_json(client, method, url, **kwargs):
    try:
        with client.stream(method, url, **kwargs) as response:
            if response.status_code != 200:
                raise SearchConsoleError('Google request failed (HTTP ' + str(response.status_code) + '); no automatic retry.')
            raw = bytearray()
            for chunk in response.iter_bytes():
                raw.extend(chunk)
                if len(raw) > MAX_BYTES:
                    raise SearchConsoleError('Google response exceeds the size limit.')
            data = json.loads(raw)
            if not isinstance(data, dict):
                raise ValueError()
            return data
    except (httpx.HTTPError, ValueError) as exc:
        if isinstance(exc, SearchConsoleError):
            raise
        raise SearchConsoleError('Google request or response failed; no automatic retry.') from None


def fetch_performance(start, end, country='hkg', root=ROOT, transport=None):
    try:
        first, last = date.fromisoformat(start), date.fromisoformat(end)
    except ValueError:
        raise SearchConsoleError('Use ISO dates YYYY-MM-DD.') from None
    if first > last or (last-first).days >= 90 or last >= datetime.now(timezone.utc).date():
        raise SearchConsoleError('Choose 1–90 past calendar days; Google report dates use Pacific Time.')
    if country not in {'hkg', 'sgp', 'all'}:
        raise SearchConsoleError('Pilot country must be hkg, sgp or all.')
    config = client_config(root)['installed']
    token = read_private(root / 'token.json')
    if token.get('client_id') != config['client_id'] or token.get('scopes') != [SCOPE] or not token.get('refresh_token'):
        raise SearchConsoleError('Google authorization does not match this read-only client.')
    with httpx.Client(timeout=20, follow_redirects=False, trust_env=False, transport=transport) as client:
        refreshed = request_json(client, 'POST', TOKEN_URL, data={
            'grant_type': 'refresh_token', 'refresh_token': token['refresh_token'],
            'client_id': config['client_id'], 'client_secret': config['client_secret']})
        access = refreshed.get('access_token')
        if not isinstance(access, str) or not access:
            raise SearchConsoleError('Google did not return an access token.')
        if 'scope' in refreshed and set(refreshed['scope'].split()) != {SCOPE}:
            raise SearchConsoleError('Unexpected token permissions; report request stopped.')
        headers = {'Authorization': 'Bearer ' + access}
        sites = request_json(client, 'GET', API, headers=headers).get('siteEntry', [])
        permitted = {s.get('siteUrl') for s in sites if isinstance(s, dict) and s.get('permissionLevel') in {'siteOwner', 'siteFullUser', 'siteRestrictedUser'}}
        selected = next((p for p in PROPERTIES if p in permitted), None)
        if not selected:
            raise SearchConsoleError('This Google account has no supported marksix.gold property access.')
        base = {'startDate': start, 'endDate': end, 'type': 'web', 'dataState': 'final'}
        if country != 'all':
            base['dimensionFilterGroups'] = [{'filters': [{'dimension': 'country', 'operator': 'equals', 'expression': country}]}]
        results = {}
        for key, dimensions, limit in [('totals', [], 1), ('daily', ['date'], 90), ('queries', ['query', 'page', 'country', 'device'], 1000)]:
            payload = dict(base, dimensions=dimensions, rowLimit=limit)
            result = request_json(client, 'POST', API + '/' + quote(selected, safe='') + '/searchAnalytics/query', headers=headers, json=payload)
            rows = result.get('rows', [])
            if not isinstance(rows, list) or len(rows) > limit:
                raise SearchConsoleError('Invalid Search Console row set.')
            for row in rows:
                if (not isinstance(row, dict) or not isinstance(row.get('keys', []), list)
                        or len(row.get('keys', [])) != len(dimensions)
                        or any(not isinstance(key, str) for key in row.get('keys', []))):
                    raise SearchConsoleError('Invalid Search Console dimension keys.')
                for metric in ('clicks', 'impressions', 'ctr', 'position'):
                    value = row.get(metric)
                    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value < float('inf'):
                        raise SearchConsoleError('Invalid Search Console metric.')
                if row['ctr'] > 1 or row['clicks'] > row['impressions']:
                    raise SearchConsoleError('Inconsistent Search Console metrics.')
            results[key] = {'request': payload, 'rows': rows, 'row_limit_reached': len(rows) == limit}
        report = {'schema_version': 'search-console-pilot-0.1', 'pilot': 'marksix-gold', 'property': selected,
                  'retrieved_at': datetime.now(timezone.utc).isoformat(), 'country': country, 'date_timezone': 'America/Los_Angeles',
                  'status': 'observed_data' if results['totals']['rows'] else 'no_rows_returned',
                  'results': results, 'limitations': [
                      'Final web-search data only; dimensions/filters/period are retained.',
                      'Top 1000 query/page/country/device rows; Google may omit anonymized or other rows. Not all keywords are returned.',
                      'Empty results mean no rows returned, not proven zero visibility.',
                      'Average position is not first-page probability; this is not causal uplift or AI citation measurement.']}
        name = 'marksix-gold-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S') + '-' + secrets.token_hex(4) + '.json'
        write_private(root / 'performance' / name, report)
        return report


def latest_hong_kong_query_pages(root=ROOT):
    """Summarize the newest saved HK Web snapshot for the local marksix pilot."""
    folder = root / 'performance'
    if root.is_symlink() or folder.is_symlink():
        return None
    for path in sorted(folder.glob('marksix-gold-*.json'), reverse=True):
        try:
            report = read_private(path)
            if (report.get('schema_version') != 'search-console-pilot-0.1'
                    or report.get('pilot') != 'marksix-gold'
                    or report.get('country') != 'hkg'
                    or report.get('property') not in PROPERTIES):
                continue
            query = report['results']['queries']
            request = query['request']
            if (request['dimensions'] != ['query', 'page', 'country', 'device']
                    or request['dataState'] != 'final' or request['type'] != 'web'
                    or request.get('dimensionFilterGroups') != [
                        {'filters': [{'dimension': 'country', 'operator': 'equals', 'expression': 'hkg'}]}]):
                continue
            start, end = (date.fromisoformat(request[key]) for key in ('startDate', 'endDate'))
            rows = query['rows']
            if start > end or not isinstance(rows, list) or len(rows) > 1000:
                continue
            grouped = {}
            for row in rows:
                keys = row['keys']
                if not isinstance(keys, list) or len(keys) != 4 or any(not isinstance(key, str) for key in keys):
                    raise ValueError('Invalid query/page dimensions.')
                term, page, country, _ = keys
                url = urlsplit(page)
                if (country != 'hkg' or url.scheme != 'https' or url.netloc not in
                        {'marksix.gold', 'www.marksix.gold'}
                        or not 0 < len(term) <= 2048 or len(page) > 2048):
                    raise ValueError('Invalid query/page row.')
                impressions, clicks, position = (row[key] for key in ('impressions', 'clicks', 'position'))
                if (type(impressions) is not int or type(clicks) is not int
                        or not 0 <= clicks <= impressions <= 10**12
                        or type(position) not in (int, float) or not math.isfinite(position)
                        or not 0 <= position <= 10**6):
                    raise ValueError('Invalid query/page metrics.')
                if impressions:
                    totals = grouped.setdefault((term, page), [0, 0, 0.0])
                    totals[0] += impressions
                    totals[1] += clicks
                    totals[2] += position * impressions
            table = [
                {'query': term, 'page': page, 'impressions': impressions, 'clicks': clicks,
                 'average_position': round(weighted_position / impressions, 1)}
                for (term, page), (impressions, clicks, weighted_position) in grouped.items()
            ]
            table.sort(key=lambda row: (-row['impressions'], row['query'], row['page']))
            return {'start': start.isoformat(), 'end': end.isoformat(), 'rows': table}
        except (KeyError, TypeError, ValueError, OSError):
            continue
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['authorize', 'fetch'])
    parser.add_argument('--start'); parser.add_argument('--end')
    parser.add_argument('--country', default='hkg', choices=['hkg', 'sgp', 'all'])
    args = parser.parse_args()
    try:
        if args.action == 'authorize':
            authorize()
            print('Read-only Google authorization saved locally. Property access is checked when fetching.')
        else:
            if not args.start or not args.end:
                parser.error('fetch requires --start and --end')
            report = fetch_performance(args.start, args.end, args.country)
            print('Saved local marksix.gold Search Console report: ' + report['status'])
    except SearchConsoleError as exc:
        print(str(exc) + ' See docs29.', file=sys.stderr)
        return 1
    except OSError:
        print('Private Google storage is unavailable. See docs29.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
