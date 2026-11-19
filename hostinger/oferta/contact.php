<?php
// Code written with help from Claude (Anthropic)
// Verifies signed offer links and tells Maria when a client wants to talk.
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function reply(array $data): void {
    echo json_encode($data);
    exit;
}

if (SECRET === '' || MAIL_TO === '') reply(['ok' => false, 'error' => 'server']);

$input = json_decode(file_get_contents('php://input'), true);
$payload = is_array($input) ? (string)($input['p'] ?? '') : '';
$signature = is_array($input) ? (string)($input['s'] ?? '') : '';
$action = is_array($input) ? (string)($input['action'] ?? '') : '';

if ($payload === '' || strlen($payload) > 8000) reply(['ok' => false, 'error' => 'invalid']);
if (!hash_equals(hash_hmac('sha256', $payload, SECRET), $signature)) reply(['ok' => false, 'error' => 'invalid']);

$json = @gzinflate(base64_decode(strtr($payload, '-_', '+/')));
$offer = $json === false ? null : json_decode($json, true);
if (!is_array($offer) || empty($offer['id']) || empty($offer['exp'])) reply(['ok' => false, 'error' => 'invalid']);
if (gmdate('Y-m-d') > $offer['exp']) reply(['ok' => false, 'error' => 'expired']);
if ($action === 'verify') reply(['ok' => true]);
if ($action !== 'contact') reply(['ok' => false, 'error' => 'invalid']);

// One email per offer, however many times the button is clicked.
$dir = __DIR__ . '/sent';
if (!is_dir($dir)) {
    if (!@mkdir($dir, 0750)) reply(['ok' => false, 'error' => 'server']);
    file_put_contents($dir . '/.htaccess', "Require all denied\n");
}
$marker = $dir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$offer['id']) . '.json';
$handle = @fopen($marker, 'x');
if ($handle === false) reply(file_exists($marker) ? ['ok' => true] : ['ok' => false, 'error' => 'server']);
fwrite($handle, gmdate('c'));
fclose($handle);

$who = preg_replace('/[\r\n]+/', ' ', (string)($offer['company'] ?: $offer['name'] ?: 'Klient'));
$lines = ["$who chce porozmawiać o ofercie.", '', 'Osoba: ' . ($offer['name'] ?? ''), 'Data oferty: ' . ($offer['date'] ?? ''), 'Oferta ważna do: ' . $offer['exp']];
$subject = '=?UTF-8?B?' . base64_encode("$who chce porozmawiać o ofercie") . '?=';
$headers = "From: " . MAIL_TO . "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8";
if (!@mail(MAIL_TO, $subject, implode("\n", $lines), $headers)) {
    unlink($marker);
    reply(['ok' => false, 'error' => 'server']);
}
reply(['ok' => true]);
