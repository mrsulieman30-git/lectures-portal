<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$f = 'storage/documents/6/17vyZmEx0RP3CIFmQMkqr4im3drmRnoGwcFchdgc.pdf';
$resp = response()->file($f, ['Content-Type' => 'application/octet-stream']);
echo 'Content-Type: ' . $resp->headers->get('Content-Type') . PHP_EOL;
echo 'Content-Disposition: ' . $resp->headers->get('Content-Disposition') . PHP_EOL;
unlink(__FILE__);
