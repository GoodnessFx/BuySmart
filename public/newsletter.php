<?php

declare(strict_types=1);

header('Content-Type: application/json');

$successMessage = "You’re subscribed. Your email has been saved to the BuySmart newsletter list and the team has been notified.";
$ownerEmail = getenv('NEWSLETTER_OWNER_EMAIL') ?: 'kingsleyglory272@gmail.com';

function send_json(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    send_json(405, ['error' => 'Method not allowed.']);
}

$rawBody = file_get_contents('php://input') ?: '';
$decoded = json_decode($rawBody, true);
$body = is_array($decoded) ? $decoded : $_POST;

$email = strtolower(trim((string)($body['email'] ?? '')));
$consent = ($body['consent'] ?? false) === true || (string)($body['consent'] ?? '') === 'true' || (string)($body['consent'] ?? '') === '1';
$source = trim((string)($body['source'] ?? 'website'));
$website = trim((string)($body['website'] ?? ''));

if ($website !== '') {
    send_json(200, ['ok' => true, 'message' => $successMessage]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(400, ['error' => 'Enter a valid email address.']);
}

if (!$consent) {
    send_json(400, ['error' => 'Please confirm newsletter consent before subscribing.']);
}

$storageDir = __DIR__ . DIRECTORY_SEPARATOR . 'newsletter-data';
$storageFile = $storageDir . DIRECTORY_SEPARATOR . 'newsletter-subscribers.csv';

if (!is_dir($storageDir) && !mkdir($storageDir, 0775, true) && !is_dir($storageDir)) {
    send_json(500, ['error' => 'Newsletter storage could not be prepared on this server.']);
}

$csvHandle = fopen($storageFile, 'c+');

if ($csvHandle === false) {
    send_json(500, ['error' => 'Newsletter storage file could not be opened.']);
}

$alreadyExists = false;

if (flock($csvHandle, LOCK_EX)) {
    rewind($csvHandle);
    $rows = [];

    while (($row = fgetcsv($csvHandle)) !== false) {
        $rows[] = $row;
    }

    if (empty($rows)) {
        $rows[] = ['email', 'source', 'subscribed_at'];
    }

    foreach ($rows as $index => $row) {
        if ($index === 0) {
            continue;
        }

        if (($row[0] ?? '') === $email) {
            $alreadyExists = true;
            break;
        }
    }

    if (!$alreadyExists) {
        ftruncate($csvHandle, 0);
        rewind($csvHandle);

        foreach ($rows as $row) {
          fputcsv($csvHandle, $row);
        }

        fputcsv($csvHandle, [$email, $source, gmdate('c')]);
    }

    fflush($csvHandle);
    flock($csvHandle, LOCK_UN);
}

fclose($csvHandle);

$subject = 'New BuySmart newsletter subscriber';
$message = "A new subscriber has joined the BuySmart newsletter.\n\nEmail: {$email}\nSource: {$source}\nTime: " . gmdate('Y-m-d H:i:s') . " UTC\n";
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: BuySmart Newsletter <no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '>',
    'Reply-To: ' . $email,
];

@mail($ownerEmail, $subject, $message, implode("\r\n", $headers));

send_json(200, [
    'ok' => true,
    'message' => $successMessage,
]);
