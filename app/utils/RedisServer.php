<?php

namespace app\utils;

use Predis\Client;

class RedisServer {
    private static $instance = null;
    public static function app(){
        if (self::$instance == null) {
            $config = config('redis.default');
            self::$instance = new Client([
                'scheme' => $config['scheme'] ?? 'tcp',
                'host'   => $config['host'],
                'port'   => $config['port'],
                "username"  => $config['username'] ?? '',
                "password"  =>  $config['password'],
            ]);
        }
        return self::$instance;
    }
}
