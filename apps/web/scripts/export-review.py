"""Export the production build as a browsable offline review snapshot."""

import argparse
import html
import json
import re
from pathlib import Path
from shutil import copyfile
from urllib.parse import unquote, urlsplit

APP = Path(__file__).resolve().parents[1]
BUILD = APP / '.next'
LOCALES = {'/en', '/zh-hant'}
OFFLINE_CSS = """
<style>
.offline-notice{padding:7px 16px;background:var(--soft);color:var(--ink);text-align:center;font-size:12px}
.offline-notice a{text-decoration:underline;text-underline-offset:2px}
@media(max-width:950px){
  .offline-preview .header-inner{flex-wrap:wrap;gap:6px;padding-block:10px}
  .offline-preview .primary-nav{display:flex;position:static;order:3;width:100%;flex-wrap:wrap;
    gap:4px 12px;padding:0;border:0;box-shadow:none}
  .offline-preview .primary-nav a{padding:5px 0}
  .offline-preview .mobile-menu{display:none}
}
</style>
"""


def read_routes():
    manifest = BUILD / 'prerender-manifest.json'
    if not manifest.is_file():
        raise SystemExit('Run npm run build in apps/web before exporting the review.')
    routes = {}
    for route in json.loads(manifest.read_text(encoding='utf-8'))['routes']:
        prefix = '/' + route.lstrip('/').split('/', 1)[0]
        if prefix in LOCALES:
            public_path = route if prefix == '/en' else route.removeprefix(prefix) or '/'
            filename = route.strip('/').replace('/', '-') + '.html'
            routes[public_path] = (route, filename)
    return routes


def render_snapshot(public_path, build_route, routes):
    template = BUILD / 'server/app' / (build_route.lstrip('/') + '.html')
    source = template.read_text(encoding='utf-8')
    english = build_route.startswith('/en')

    def inline_css(match):
        stylesheet = BUILD / unquote(match[1].removeprefix('/_next/'))
        return '<style>' + stylesheet.read_text(encoding='utf-8') + '</style>'

    def rewrite_link(match):
        url = urlsplit(html.unescape(match[1]))
        if url.scheme or url.netloc or url.path not in routes:
            return match[0]
        filename = routes[url.path][1]
        if url.fragment:
            filename += '#' + url.fragment
        return 'href="' + html.escape(filename, quote=True) + '"'

    source = re.sub(r'<link rel="stylesheet" href="(/_next/[^"]+)"[^>]*>', inline_css, source)
    source = re.sub(r'<link\b[^>]*href="/_next/[^"]*"[^>]*>', '', source)
    source = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', '', source)
    source = re.sub(r'(?<![\w-])href="(/[^"]*)"', rewrite_link, source)
    source = source.replace('"/brand/', '"assets/').replace('href="/icon.svg', 'href="assets/icon.svg')
    source = source.replace('</head>', OFFLINE_CSS + '</head>', 1)
    label = 'Offline review' if english else '離線預覽'
    link_text = 'Open the running app for interactive features' if english else '開啟本機網站以使用互動功能'
    live_url = 'http://127.0.0.1:30101' + public_path
    banner = f'<p class="offline-notice">{label} · <a href="{live_url}">{link_text}</a></p>'
    source = source.replace('<body>', '<body class="offline-preview">' + banner, 1)
    source = re.sub(r'<button\b(?![^>]*\bdisabled\b)', '<button disabled', source)
    source = re.sub(r'<form\b', '<form inert', source)
    if build_route.endswith('/admin'):
        if english:
            source = source.replace('Loading workspace…', 'Start the local app to open the interactive admin workspace.')
        else:
            source = source.replace('正在載入工作空間…', '請啟動本機網站以開啟互動管理平台。')
    return source


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path, help='Destination directory for the review HTML files')
    output = parser.parse_args().output
    routes = read_routes()
    pages = {
        filename: render_snapshot(public_path, build_route, routes)
        for public_path, (build_route, filename) in routes.items()
    }
    assets = output / 'assets'
    assets.mkdir(parents=True, exist_ok=True)
    copyfile(APP / 'public/brand/ambassador-bloom.webp', assets / 'ambassador-bloom.webp')
    copyfile(APP / 'app/icon.svg', assets / 'icon.svg')
    for filename, content in pages.items():
        target = output / filename
        pending = target.with_suffix('.html.tmp')
        pending.write_text(content, encoding='utf-8')
        pending.replace(target)
    copyfile(output / 'zh-hant.html', output / 'index.html')
    (output / 'mobile.html').write_text(
        '<!doctype html><html lang="en"><meta charset="utf-8">'
        '<title>SAMPAN.ai mobile review</title>'
        '<style>body{margin:16px;background:#f8ebe2}iframe{max-width:100%;height:850px;'
        'margin:0 12px 12px 0;vertical-align:top;border:1px solid #ebd8ca}</style>'
        '<iframe src="en.html" width="390" title="English mobile preview"></iframe>'
        '<iframe src="zh-hant.html" width="320" title="Traditional Chinese mobile preview"></iframe>',
        encoding='utf-8',
    )
    print(f'Exported {len(pages)} pages to {output}')


if __name__ == '__main__':
    main()
