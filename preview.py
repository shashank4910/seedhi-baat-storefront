from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import os
root=Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0]=='/api/catalog':
            data=(root/'catalog.json').read_bytes()
            self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(data)
        else: super().do_GET()
    def do_POST(self):
        self.send_response(409);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b'{"error":"Preview only: no payment or customer data is submitted."}')
os.chdir(root/'public')
print('Preview: http://127.0.0.1:8765',flush=True)
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
