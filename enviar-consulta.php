<?php
declare(strict_types=1);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Content-Type: text/html; charset=UTF-8');
function stopRequest(int $status, string $message): void {
    http_response_code($status);
    if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => false, 'message' => $message]);
        exit;
    }
    echo '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contacto — P&amp;P</title><body style="background:#f7f5ef;color:#14150f;font:18px/1.6 system-ui;max-width:600px;margin:12vh auto;padding:24px"><h1>No pudimos enviar el mensaje</h1><p>'.htmlspecialchars($message, ENT_QUOTES, 'UTF-8').'</p><p><a href="javascript:history.back()">Volver al formulario</a></p><a href="mailto:consultas@psicoterapiapyp.com">consultas@psicoterapiapyp.com</a></body></html>';
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    stopRequest(405, 'Usá el formulario de contacto para enviar tu consulta.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) stopRequest(413, 'El mensaje es demasiado extenso.');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ['https://psicoterapiapyp.com', 'https://www.psicoterapiapyp.com'], true)) stopRequest(403, 'Abrí el formulario desde nuestra web.');
function field(string $key, int $max): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $max || strpos($value, "\0") !== false) stopRequest(422, 'Revisá los datos ingresados.');
    return trim($value);
}
if (field('_honey', 500) !== '') stopRequest(422, 'No se pudo validar el formulario.');
$name = field('Nombre', 400);
$email = field('Email', 254);
$message = field('Mensaje', 12000);
$phone = field('Teléfono internacional', 100);
if ($phone === '') $phone = field('Teléfono', 100);
if ($name === '' || strlen($message) < 10 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) stopRequest(422, 'Completá tu nombre, un email válido y un mensaje de al menos 10 caracteres.');
// Store only hashed IP counters outside the public directory; never store messages.
$dir = sys_get_temp_dir().'/pyp-contact-'.substr(hash('sha256', __DIR__), 0, 16);
if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) stopRequest(503, 'Intentá nuevamente más tarde o escribinos por email.');
$file = @fopen($dir.'/limits.json', 'c+');
if (!$file || !flock($file, LOCK_EX)) stopRequest(503, 'Intentá nuevamente más tarde.');
$now = time();
$data = json_decode(stream_get_contents($file), true);
if (!is_array($data)) $data = [];
foreach ($data as $key => $entry) if (($entry['until'] ?? 0) <= $now) unset($data[$key]);
$ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$entry = $data[$ip] ?? ['until' => $now + 3600, 'count' => 0];
$global = $data['global'] ?? ['until' => $now + 3600, 'count' => 0];
if ($entry['count'] >= 5 || $global['count'] >= 100) {
    flock($file, LOCK_UN); fclose($file);
    header('Retry-After: 3600');
    stopRequest(429, 'Alcanzaste el límite de envíos. Probá más tarde o escribinos por email.');
}
$entry['count']++; $global['count']++;
$data[$ip] = $entry; $data['global'] = $global;
rewind($file); ftruncate($file, 0); fwrite($file, json_encode($data)); fflush($file);
flock($file, LOCK_UN); fclose($file);
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
if (!$sent) stopRequest(503, 'El hosting no pudo procesar el envío. Intentá más tarde o escribinos por email.');
if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['ok' => true]);
    exit;
}
$target = '/gracias/';
header('Location: '.$target, true, 303);
exit;
