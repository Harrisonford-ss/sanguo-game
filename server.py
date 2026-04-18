import http.server
import functools

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

handler = functools.partial(NoCacheHandler, directory='/home/ubuntu/sanguo-game')
httpd = http.server.HTTPServer(('0.0.0.0', 3333), handler)
print('No-cache server on :3333')
httpd.serve_forever()
