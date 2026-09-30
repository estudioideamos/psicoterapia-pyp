"""Isolated PHP CLI security regression checks. mail() is replaced: no mail is sent."""
import base64, json, os, shutil, subprocess, tempfile, time
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
PHP = os.environ.get("PHP_BINARY", "php")
with tempfile.TemporaryDirectory(prefix="pyp-security-") as temp:
    base = Path(temp)
    site = base / "site"
    site.mkdir()
    endpoint = site / "enviar-consulta.php"
    shutil.copyfile(ROOT / "enviar-consulta.php", endpoint)
    calls = base / "mail-count"
    harness = base / "request.php"
    harness.write_text("""<?php
function mail(...$args) { file_put_contents(getenv('PYP_TEST_MAIL'), 'x', FILE_APPEND); return getenv('PYP_TEST_FAIL') !== '1'; }
$r=json_decode(base64_decode(getenv('PYP_TEST_REQUEST')), true);
$_SERVER=$r['server']; $_GET=$r['get']; $_POST=$r['post'];
register_shutdown_function(function(){ echo "\nSTATUS:".(http_response_code() ?: 200); });
require getenv('PYP_TEST_ENDPOINT');
""", encoding="utf-8")
    def request(method="POST", post=None, origin="https://psicoterapiapyp.com", query=None, length=1000, fail=False):
        payload={"server":{"REQUEST_METHOD":method,"HTTP_ACCEPT":"application/json","HTTP_ORIGIN":origin,"REMOTE_ADDR":"127.0.0.1","CONTENT_LENGTH":str(length)},"get":query or {},"post":post or {}}
        env={**os.environ,"PYP_TEST_MAIL":str(calls),"PYP_TEST_ENDPOINT":str(endpoint),"PYP_TEST_FAIL":"1" if fail else "0","PYP_TEST_REQUEST":base64.b64encode(json.dumps(payload).encode()).decode()}
        result=subprocess.run([PHP,"-d","disable_functions=mail","-d",f"sys_temp_dir={base}",str(harness)],capture_output=True,text=True,env=env,timeout=15)
        body,status=result.stdout.rsplit("\nSTATUS:",1)
        return int(status),json.loads(body)
    count=0
    def check(expected, **kwargs):
        global count
        status,body=request(**kwargs)
        assert status==expected,(status,expected,body)
        count+=1
        return body
    check(405,method="PUT")
    check(403,origin="https://example.org")
    check(403,origin="https://psicoterapiapyp.com.attacker.example")
    check(413,length=20001)
    check(422,post={"Nombre":["array"]})
    check(422,post={"_t":"invalid"})
    tokens=[check(200,method="GET",query={"t":"1"})["token"] for _ in range(12)]
    time.sleep(3.1)
    def data(i,**values):
        return {"_t":tokens[i],"Nombre":"Prueba segura","Email":"test@example.com","Mensaje":f"Consulta de prueba numero {i}",**values}
    check(422,post=data(0,Email="bad\r\nBcc: injected@example.com"))
    check(422,post=data(0,Nombre=["bad"]))
    check(422,post=data(0,Mensaje="<script>alert(1)</script>"))
    check(200,post=data(0))
    check(422,post=data(0))  # replay
    check(200,post=data(1,Mensaje="Consulta de prueba numero 0"))
    assert calls.read_text()=="x", "duplicate must not send a second mail"
    check(503,post=data(2),fail=True)
    check(200,post=data(2))  # failed transport must allow retry
    for i in [3,4,5]: check(200,post=data(i))
    check(429,post=data(6))
    config=base/'pyp-contact-secrets.php'
    config.write_text("<?php define('PYP_RECAPTCHA_SECRET','test'); define('PYP_RECAPTCHA_VERIFY_URL','http://127.0.0.1:1/');",encoding='utf-8')
    check(503,post=data(7,**{'g-recaptcha-response':'test'}))
    config.unlink()
    state=next(base.glob('pyp-contact-*/state.json'))
    state.write_text('{broken',encoding='utf-8')
    check(503,post=data(8))
    print(f"PASS: {count} isolated security checks; no real email sent")
