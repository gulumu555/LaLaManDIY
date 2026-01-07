<?php
require_once '/var/www/html/vendor/autoload.php';
require_once '/var/www/html/support/bootstrap.php';

use app\common\model\SeedDreamStyleModel;

echo "--- START TEST ---\n";

// 1. Get ID 23
$model = SeedDreamStyleModel::find(23);
if (!$model) {
    die("ID 23 not found\n");
}
echo "Original style_strength: " . $model->style_strength . "\n";
echo "Original category: " . $model->category . "\n";

// 2. Update
$model->style_strength = 0.33;
$model->category = 'anime';
$result = $model->save();

echo "Save Result: " . ($result ? 'true' : 'false') . "\n";

// 3. Re-read
$modelNew = SeedDreamStyleModel::find(23);
echo "New style_strength: " . $modelNew->style_strength . "\n";

if (abs($modelNew->style_strength - 0.33) < 0.001) {
    echo "SUCCESS: Persisted!\n";
} else {
    echo "FAILURE: Not persisted!\n";
}
echo "--- END TEST ---\n";
