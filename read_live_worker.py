from pathlib import Path
import tomllib,subprocess,json
root=Path(__file__).parent
auth=tomllib.loads(Path(r'C:/Users/Admin/AppData/Roaming/xdg.config/.wrangler/config/default.toml').read_text())
token=auth['oauth_token']
base='https://api.cloudflare.com/client/v4/accounts/cc44de269b4c7292c4918a6bca434a81/workers/scripts/books'
for endpoint,name in [('/content/v2','worker-multipart.bin'),('/settings','worker-settings.json')]:
    dest=root/name
    cfg=f'url = "{base+endpoint}"\nheader = "Authorization: Bearer {token}"\n'
    r=subprocess.run(['curl.exe','-sS','--fail','--max-time','40','-K','-','-D',str(root/(name+'.headers')),'-o',str(dest)],input=cfg,text=True,capture_output=True)
    if r.returncode: raise SystemExit('Cloudflare read failed for '+endpoint+'; status '+str(r.returncode))
    print('Saved current Worker '+endpoint)
if (root/'worker-settings.json').exists():
    data=json.loads((root/'worker-settings.json').read_text())
    print('Settings available:',data.get('success',False))
