<?php
/**
 * List all tables in database
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../support/bootstrap.php';

use think\facade\Db;

echo "Listing all tables in database...\n\n";

try {
    $tables = Db::query("SHOW TABLES");
    foreach ($tables as $table) {
        $name = array_values($table)[0];
        echo $name . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
