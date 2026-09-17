"""Publish only reviewed assets with the exact recovered production Worker.
Credentials stay in memory. Every existing binding is inherited strictly.
Usage: python publish.py prepare | deploy VERSION
"""
from pathlib import Path
import base64,hashlib,http.client,json,mimetypes,sys,tomllib,urllib.request,urllib.error,uuid
root=Path(__file__).resolve().parent
account='cc44de269b4c7292c4918a6bca434a81'
api='https://api.cloudflare.com/client/v4/accounts/'+account
script='/workers/scripts/books'
token=tomllib.loads(Path(r'C:/Users/Admin/AppData/Roaming/xdg.config/.wrangler/config/default.toml').read_text())['oauth_token']
def request(path,method='GET',data=None,content='application/json',credential=None):
    import time
    last=None
    for attempt in range(4):
        req=urllib.request.Request(api+path,data=data,method=method,headers={'Authorization':'Bearer '+(credential or token),'Content-Type':content,'User-Agent':'SeedhiBaatDeployment/1.0'})
        try:
            with urllib.request.urlopen(req,timeout=50) as r: result=json.load(r)
            if not result.get('success'): raise RuntimeError('Cloudflare request failed: '+json.dumps(result.get('errors')))
            return result['result']
        except urllib.error.HTTPError as e:
            try: errors=json.loads(e.read()).get('errors',[])
            except Exception: errors=[]
            if e.code>=500 and attempt<3: last=e; time.sleep(2+attempt*3); continue
            raise RuntimeError('Cloudflare HTTP '+str(e.code)+' '+json.dumps(errors)) from None
        except (urllib.error.URLError,http.client.RemoteDisconnected,TimeoutError,ConnectionError,OSError) as e:
            last=e
            if attempt<3: time.sleep(2+attempt*3); continue
            raise RuntimeError('Network failure after retries: '+repr(e)) from None
    raise RuntimeError('Network failure after retries: '+repr(last))
def multipart(parts):
    boundary=uuid.uuid4().hex;chunks=[]
    for name,filename,content,data in parts:
        chunks.extend([('--'+boundary+'\r\n').encode(),('Content-Disposition: form-data; name="'+name+'"; filename="'+filename+'"\r\nContent-Type: '+content+'\r\n\r\n').encode(),data,b'\r\n'])
    chunks.append(('--'+boundary+'--\r\n').encode())
    return b''.join(chunks),'multipart/form-data; boundary='+boundary
def fingerprint():
    return {str(p.relative_to(root/'public')).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((root/'public').rglob('*')) if p.is_file()}
mode=sys.argv[1]
if mode=='prepare':
    settings=request(script+'/settings')
    old=json.loads((root/'worker-settings.json').read_text())['result']
    if settings!=old: raise SystemExit('Live settings changed since backup; review before publishing.')
    deployments=request(script+'/deployments')
    (root/'deployment-before.json').write_text(json.dumps(deployments,indent=2))
    manifest={}; files={}
    for path in sorted((root/'public').rglob('*')):
        if not path.is_file():continue
        data=path.read_bytes(); digest=hashlib.md5(data).hexdigest(); key='/'+path.relative_to(root/'public').as_posix()
        manifest[key]={'hash':digest,'size':len(data)}; files[digest]=(path,data)
    session=request(script+'/assets-upload-session','POST',json.dumps({'manifest':manifest}).encode())
    completion=session['jwt'] if not session['buckets'] else None
    for bucket in session['buckets']:
        parts=[]
        for digest in bucket:
            path,data=files[digest]
            parts.append((digest,digest,{'webp':'image/webp'}.get(path.suffix.lstrip('.')) or mimetypes.guess_type(path.name)[0] or 'application/octet-stream',base64.b64encode(data)))
        payload,content=multipart(parts)
        result=request('/workers/assets/upload?base64=true','POST',payload,content,session['jwt'])
        if result.get('jwt'):completion=result['jwt']
    if not completion: raise SystemExit('Asset upload incomplete; production unchanged.')
    metadata={key:settings[key] for key in ['compatibility_date','compatibility_flags','usage_model','placement','tags','tail_consumers','logpush'] if key in settings}
    metadata.update({'main_module':'index.js','bindings':[{'name':b['name'],'type':'assets' if b['type']=='assets' else 'inherit'} for b in settings['bindings']], 'assets':{'jwt':completion,'config':{'run_worker_first':True}},'annotations':{'workers/message':'Mobile conversion update: clear offers, samples and checkout contents; production backend preserved.'}})
    payload,content=multipart([('metadata','metadata.json','application/json',json.dumps(metadata).encode()),('index.js','index.js','application/javascript+module',(root/'live-worker/index.js').read_bytes())])
    version=request(script+'/versions?bindings_inherit=strict','POST',payload,content)
    record={'version':version['id'],'assets':fingerprint(),'worker_sha256':hashlib.sha256((root/'live-worker/index.js').read_bytes()).hexdigest()}
    (root/'prepared-version.json').write_text(json.dumps(record,indent=2))
    print('Prepared version '+version['id']+'. Not yet deployed.')
elif mode=='deploy':
    record=json.loads((root/'prepared-version.json').read_text())
    if sys.argv[2]!=record['version'] or record['assets']!=fingerprint():raise SystemExit('Source changed after validation; prepare again.')
    before=json.loads((root/'deployment-before.json').read_text())
    if request(script+'/deployments')!=before:raise SystemExit('Another deployment occurred; review before switching traffic.')
    result=request(script+'/deployments','POST',json.dumps({'strategy':'percentage','versions':[{'version_id':record['version'],'percentage':100}],'annotations':{'workers/message':'Publish reviewed mobile conversion improvements'}}).encode())
    (root/'deployment-result.json').write_text(json.dumps(result,indent=2))
    print('Deployed version '+record['version'])
else:raise SystemExit('Use prepare or deploy VERSION')
