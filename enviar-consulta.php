<?php
declare(strict_types=1);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Content-Type: text/html; charset=UTF-8');

// Configuración opcional del servidor (fuera de public_html y fuera del repositorio):
//   /home18/psicoterapiapyp/pyp-contact-secrets.php
// Ver docs/formulario-antispam.md. Sin ese archivo el formulario funciona igual,
// solo sin reCAPTCHA.
const PYP_ALLOWED_HOSTS = ['psicoterapiapyp.com', 'www.psicoterapiapyp.com'];
const PYP_TOKEN_MIN_AGE = 3;       // segundos entre abrir el formulario y enviarlo
const PYP_TOKEN_MAX_AGE = 21600;   // el token vence a las 6 horas
const PYP_LIMIT_PER_IP = 5;        // envíos por hora y por IP
const PYP_LIMIT_GLOBAL = 30;       // envíos por hora en total
$configFile = dirname(__DIR__).'/pyp-contact-secrets.php';
if (is_readable($configFile)) {
    try {
        include_once $configFile;
    } catch (Throwable $error) {
        error_log('PYP contact: archivo de configuración ilegible');
    }
}

function wantsJson(): bool {
    return strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}
function stopRequest(int $status, string $message, string $code = ''): void {
    http_response_code($status);
    if (wantsJson()) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => false, 'message' => $message, 'code' => $code]);
        exit;
    }
    echo '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contacto — P&amp;P</title><body style="background:#f7f5ef;color:#14150f;font:18px/1.6 system-ui;max-width:600px;margin:12vh auto;padding:24px"><h1>No pudimos enviar el mensaje</h1><p>'.htmlspecialchars($message, ENT_QUOTES, 'UTF-8').'</p><p><a href="javascript:history.back()">Volver al formulario</a></p><a href="mailto:consultas@psicoterapiapyp.com">consultas@psicoterapiapyp.com</a></body></html>';
    exit;
}
// Con el JS actual el token se renueva solo tras un fallo: alcanza con volver a enviar.
// Solo si el token faltó por completo (pestaña abierta antes de una actualización, sin JS)
// hay que recargar la página.
function tokenMessage(bool $hadToken): string {
    return ($hadToken && wantsJson())
        ? 'La sesión del formulario venció. Presioná "Enviar mensaje" nuevamente.'
        : 'La sesión del formulario venció. Recargá la página e intentá nuevamente, o escribinos por email o WhatsApp.';
}
function finishOk(): void {
    if (wantsJson()) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => true]);
        exit;
    }
    header('Location: /gracias/', true, 303);
    exit;
}

// Estado mínimo fuera del directorio público: solo contadores y huellas (hash) con
// vencimiento. Nunca se guardan mensajes, nombres, emails ni IP en claro.
function stateDir(): string {
    $dir = sys_get_temp_dir().'/pyp-contact-'.substr(hash('sha256', __DIR__), 0, 16);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) stopRequest(503, 'Intentá nuevamente más tarde o escribinos por email.');
    return $dir;
}
function formSecret(string $dir): string {
    $file = $dir.'/secret.key';
    $secret = @file_get_contents($file);
    if (is_string($secret) && strlen($secret) >= 32) return $secret;
    $secret = bin2hex(random_bytes(32));
    $handle = @fopen($file, 'x');   // creación exclusiva: si otro proceso ganó, usamos la suya
    if ($handle) {
        fwrite($handle, $secret);
        fclose($handle);
        @chmod($file, 0600);
        return $secret;
    }
    $existing = @file_get_contents($file);
    return (is_string($existing) && strlen($existing) >= 32) ? $existing : $secret;
}
function withState(string $dir, callable $change) {
    $file = @fopen($dir.'/state.json', 'c+');
    if (!$file || !flock($file, LOCK_EX)) stopRequest(503, 'Intentá nuevamente más tarde.');
    $now = time();
    $state = json_decode((string)stream_get_contents($file), true);
    if (!is_array($state)) $state = [];
    foreach (['ip' => 'until', 'nonces' => null, 'dups' => null] as $section => $field) {
        $entries = is_array($state[$section] ?? null) ? $state[$section] : [];
        foreach ($entries as $key => $entry) {
            $until = $field === null ? (int)$entry : (int)($entry['until'] ?? 0);
            if ($until <= $now) unset($entries[$key]);
        }
        $state[$section] = $entries;
    }
    if ((int)($state['global']['until'] ?? 0) <= $now) $state['global'] = ['until' => $now + 3600, 'count' => 0];
    $result = $change($state, $now);
    rewind($file);
    ftruncate($file, 0);
    fwrite($file, json_encode($state));
    fflush($file);
    flock($file, LOCK_UN);
    fclose($file);
    return $result;
}

function recaptchaEnabled(): bool {
    return defined('PYP_RECAPTCHA_SECRET') && (string)PYP_RECAPTCHA_SECRET !== '';
}

// 1) El formulario pide un token firmado al abrirse. Un bot que postea directo al
//    handler no lo tiene; uno que lo pide debe además esperar y usarlo una sola vez.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['t'])) {
    $payload = time().'.'.bin2hex(random_bytes(12));
    $token = $payload.'.'.hash_hmac('sha256', $payload, formSecret(stateDir()));
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'ok' => true,
        'token' => $token,
        'recaptcha' => (recaptchaEnabled() && defined('PYP_RECAPTCHA_SITE_KEY')) ? (string)PYP_RECAPTCHA_SITE_KEY : null,
    ]);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    stopRequest(405, 'Usá el formulario de contacto para enviar tu consulta.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) stopRequest(413, 'El mensaje es demasiado extenso.');

// 2) Origin (o, si falta, Referer) es obligatorio y debe ser nuestro sitio.
$allowedOrigins = [];
foreach (PYP_ALLOWED_HOSTS as $host) $allowedOrigins[] = 'https://'.$host;
if (defined('PYP_EXTRA_ORIGINS')) foreach ((array)PYP_EXTRA_ORIGINS as $extra) $allowedOrigins[] = (string)$extra;
$allowedOrigins = array_map('strtolower', $allowedOrigins);
$source = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($source === '' || $source === 'null') $source = $_SERVER['HTTP_REFERER'] ?? '';
$parts = parse_url($source);
$sourceOrigin = (is_array($parts) && isset($parts['scheme'], $parts['host']))
    ? strtolower($parts['scheme'].'://'.$parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : ''))
    : '';
if ($sourceOrigin === '' || !in_array($sourceOrigin, $allowedOrigins, true)) stopRequest(403, 'No pudimos validar el formulario desde tu navegador. Recargá la página o escribinos por email o WhatsApp.');

function field(string $key, int $max): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $max || strpos($value, "\0") !== false || !preg_match('//u', $value)) stopRequest(422, 'Revisá los datos ingresados.');
    return trim($value);
}
if (field('_honey', 500) !== '') stopRequest(422, 'No se pudo validar el formulario.');

// 3) Token firmado, con antigüedad razonable y de un solo uso (el uso se registra más abajo).
$secret = formSecret($dir = stateDir());
$tokenOk = false;
$nonce = '';
$rawToken = field('_t', 200);
if (preg_match('/^(\d{10})\.([0-9a-f]{24})\.([0-9a-f]{64})$/', $rawToken, $m)
    && hash_equals(hash_hmac('sha256', $m[1].'.'.$m[2], $secret), $m[3])) {
    $age = time() - (int)$m[1];
    if ($age >= -60 && $age <= PYP_TOKEN_MAX_AGE) $tokenOk = true;
    $nonce = $m[2];
}
if (!$tokenOk) stopRequest(422, tokenMessage($rawToken !== ''), 'token');
if (time() - (int)$m[1] < PYP_TOKEN_MIN_AGE) stopRequest(429, 'Esperá unos segundos e intentá nuevamente.', 'toofast');

$name = field('Nombre', 400);
$email = field('Email', 254);
$message = field('Mensaje', 12000);
// PHP reemplaza los espacios de los nombres de campo por "_": el campo que arma el
// formulario como "Teléfono internacional" llega como "Teléfono_internacional".
$phone = field('Teléfono_internacional', 100);
if ($phone === '') $phone = field('Teléfono', 100);
if ($name === '' || strlen($message) < 10 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) stopRequest(422, 'Completá tu nombre, un email válido y un mensaje de al menos 10 caracteres.');

// 4) Filtros de contenido deliberadamente conservadores: un mensaje real casi nunca
//    trae varios enlaces, HTML ni un nombre con URL o email.
if (preg_match('~https?://|www\.|@~i', $name)) stopRequest(422, 'Ingresá solo tu nombre.');
if (preg_match_all('~(?:https?://|www\.)\S+~i', $message) > 1 || preg_match('~<\s*(?:a|script|iframe)\b|\[url[=\]]~i', $message)) {
    stopRequest(422, 'Tu mensaje incluye enlaces o contenido no permitido. Escribilo en texto simple o contactanos por email o WhatsApp.');
}
if (preg_match_all('/\p{L}/u', $message) < 5) stopRequest(422, 'Escribí tu consulta con algunas palabras para que podamos responderte.');

// 5) reCAPTCHA v3 (solo si el servidor tiene la clave secreta configurada).
if (recaptchaEnabled()) {
    $response = field('g-recaptcha-response', 4096);
    $verified = false;
    if ($response !== '') {
        $url = defined('PYP_RECAPTCHA_VERIFY_URL') ? (string)PYP_RECAPTCHA_VERIFY_URL : 'https://www.google.com/recaptcha/api/siteverify';
        $payload = http_build_query(['secret' => (string)PYP_RECAPTCHA_SECRET, 'response' => $response]);
        if (function_exists('curl_init')) {
            $curl = curl_init($url);
            curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $payload, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5, CURLOPT_CONNECTTIMEOUT => 3]);
            $raw = curl_exec($curl);
        } else {
            $raw = @file_get_contents($url, false, stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => $payload, 'timeout' => 5]]));
        }
        $result = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($result)) {
            // Si Google no responde no bloqueamos consultas reales: quedan los demás controles.
            error_log('PYP contact: verificación reCAPTCHA no disponible, se omite');
            $verified = true;
        } else {
            $allowedHostnames = [];
            foreach ($allowedOrigins as $origin) $allowedHostnames[] = (string)parse_url($origin, PHP_URL_HOST);
            $hostOk = in_array(strtolower((string)($result['hostname'] ?? '')), $allowedHostnames, true);
            $minScore = defined('PYP_RECAPTCHA_MIN_SCORE') ? (float)PYP_RECAPTCHA_MIN_SCORE : 0.5;
            $verified = ($result['success'] ?? false) === true && $hostOk && ($result['action'] ?? '') === 'contacto' && (float)($result['score'] ?? 0) >= $minScore;
        }
    }
    if (!$verified) stopRequest(403, 'No pudimos verificar que sos una persona. Escribinos por WhatsApp o a consultas@psicoterapiapyp.com.', 'captcha');
}

// 6) Un solo uso por token, sin duplicados recientes y con límites por hora.
$ipKey = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $secret);
$dupKey = hash_hmac('sha256', strtolower($email)."\n".strtolower(preg_replace('/\s+/u', ' ', $message)), $secret);
$gate = withState($dir, function (array &$state, int $now) use ($nonce, $ipKey, $dupKey) {
    if (isset($state['nonces'][$nonce])) return 'replay';
    if (isset($state['dups'][$dupKey])) return 'duplicate';
    $ip = $state['ip'][$ipKey] ?? ['until' => $now + 3600, 'count' => 0];
    if ($ip['count'] >= PYP_LIMIT_PER_IP || $state['global']['count'] >= PYP_LIMIT_GLOBAL) return 'limit';
    $ip['count']++;
    $state['ip'][$ipKey] = $ip;
    $state['global']['count']++;
    $state['nonces'][$nonce] = $now + PYP_TOKEN_MAX_AGE;
    $state['dups'][$dupKey] = $now + 86400;
    return 'ok';
});
if ($gate === 'replay') stopRequest(422, tokenMessage(true), 'token');
if ($gate === 'limit') {
    header('Retry-After: 3600');
    stopRequest(429, 'Alcanzaste el límite de envíos. Probá más tarde o escribinos por email.');
}
// Mismo mensaje del mismo email en las últimas 24 h: ya lo recibimos. Se responde como
// enviado (doble clic, reintento tras un corte) sin duplicar el correo ni dar pistas a un bot.
if ($gate === 'duplicate') finishOk();

$body = "Nueva consulta desde la web\n\nNombre: $name\nEmail: $email\nTeléfono: $phone\n\nMensaje:\n$message\n";
$headers = [
    'From' => 'Psicoterapia P&P <consultas@psicoterapiapyp.com>',
    'Reply-To' => $email,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => 'base64'
];
$sent = false;
try {
    $sent = function_exists('mail') && @mail('consultas@psicoterapiapyp.com', 'Nueva consulta desde psicoterapiapyp.com', chunk_split(base64_encode($body)), $headers);
} catch (Throwable $error) {
    error_log('PYP contact: local mail transport unavailable');
}
if (!$sent) {
    // Si el hosting falla, se devuelve el cupo para que el reintento no se tome por duplicado.
    withState($dir, function (array &$state, int $now) use ($nonce, $ipKey, $dupKey): void {
        unset($state['nonces'][$nonce], $state['dups'][$dupKey]);
        if (($state['ip'][$ipKey]['count'] ?? 0) > 0) $state['ip'][$ipKey]['count']--;
        if ($state['global']['count'] > 0) $state['global']['count']--;
    });
    stopRequest(503, 'El hosting no pudo procesar el envío. Intentá más tarde o escribinos por email.');
}
finishOk();
