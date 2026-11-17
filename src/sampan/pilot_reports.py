"""Bounded local pilot report history. Not a public multi-tenant account system."""
import json
import os
import re
import secrets
from pathlib import Path

PILOTS={
    'vx-real':{'name':'VX Real','url':'https://vxreal.com/','host':'vxreal.com'},
    'marksix-gold':{'name':'marksix.gold','url':'https://marksix.gold/','host':'marksix.gold'},
}
MAX_REPORT_BYTES=2_000_000
MAX_REPORTS=10


class PilotReportStore:
    def __init__(self,root):self.root=Path(root)

    def save(self,pilot,report):
        if pilot not in PILOTS:raise ValueError('Unknown pilot.')
        from urllib.parse import urlsplit
        if urlsplit(report['url']).hostname not in {PILOTS[pilot]['host'],'www.'+PILOTS[pilot]['host']}:
            raise ValueError('Report URL does not match this pilot.')
        folder=self.root/pilot
        if folder.is_symlink():raise ValueError('Pilot storage is unavailable.')
        folder.mkdir(parents=True,exist_ok=True,mode=0o700)
        if len(list(folder.glob('*.json')))>=MAX_REPORTS:raise ValueError('Local pilot report limit reached. Export existing reports before adding more.')
        payload=json.dumps({'pilot':pilot,'report':report},ensure_ascii=False).encode()
        if len(payload)>MAX_REPORT_BYTES:raise ValueError('Report exceeds the local storage limit.')
        ident=secrets.token_hex(12)
        with os.fdopen(os.open(folder/(ident+'.json'),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600),'wb') as f:f.write(payload)
        return ident

    def load(self,ident):
        if not re.fullmatch(r'[a-f0-9]{24}',ident):raise ValueError('Invalid report ID.')
        for pilot in PILOTS:
            if (self.root/pilot).is_symlink():raise ValueError('Report is unavailable.')
            p=self.root/pilot/(ident+'.json')
            if p.is_symlink():raise ValueError('Report is unavailable.')
            if not p.is_file():continue
            if p.stat().st_size>MAX_REPORT_BYTES:raise ValueError('Report exceeds the local storage limit.')
            row=json.loads(p.read_bytes())
            if row.get('pilot')!=pilot or not isinstance(row.get('report'),dict):raise ValueError('Invalid report record.')
            return row
        raise ValueError('Report not found.')

    def index(self):
        rows=[]
        for pilot,info in PILOTS.items():
            reports=[];unavailable=0
            folder=self.root/pilot
            if folder.is_dir() and not folder.is_symlink():
                for p in sorted(folder.glob('*.json'))[:MAX_REPORTS]:
                    try:
                        row=self.load(p.stem);r=row['report'];effective=r.get('rendered_audit') or r
                        reports.append({'id':p.stem,'scanned_at':r['scanned_at'],'url':r['url'],
                            'rubric_version':r['rubric_version'],'topic_version':r.get('topic_assessment',{}).get('version'),
                            'source_mode':effective['source_mode'],'pages_reviewed':r.get('collection',{}).get('topic_pages_reviewed'),
                            'seo':effective['scores']['seo']['score'],'geo':effective['scores']['geo']['score']})
                    except (ValueError,KeyError,TypeError,OSError):unavailable+=1
            reports.sort(key=lambda r:r['scanned_at'],reverse=True)
            rows.append(dict(id=pilot,**info,reports=reports,unavailable_reports=unavailable))
        return rows
