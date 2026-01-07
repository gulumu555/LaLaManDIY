<?php
/**
 * This file is part of webman.
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the MIT-LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @author    walkor<walkor@workerman.net>
 * @copyright walkor<walkor@workerman.net>
 * @link      http://www.workerman.net/
 * @license   http://www.opensource.org/licenses/mit-license.php MIT License
 */

use Webman\Route;

// Admin SPA fallback - serve index.html for /admin and /admin/
Route::get('/admin', function () {
    return response(file_get_contents(public_path() . '/admin/index.html'))
        ->header('Content-Type', 'text/html');
});

Route::get('/admin/', function () {
    return response(file_get_contents(public_path() . '/admin/index.html'))
        ->header('Content-Type', 'text/html');
});


