<?php
require_once '/var/www/html/vendor/autoload.php';
require_once '/var/www/html/support/bootstrap.php';

use app\common\logic\SeedDreamStyleLogic;

echo "--- START READ TEST ---\n";

// Read ID 23
$data = SeedDreamStyleLogic::findData(23);

if (!$data) {
    die("ID 23 not found\n");
}

echo "Data ID: " . $data['id'] . "\n";
echo "Style Strength: " . $data['style_strength'] . "\n";
echo "Identity Strength: " . $data['identity_strength'] . "\n";
echo "Category: " . $data['category'] . "\n";

echo "Full Data JSON: " . json_encode($data) . "\n";

echo "--- END READ TEST ---\n";
