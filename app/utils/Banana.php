<?php

namespace app\utils;

use GuzzleHttp\Client;

class Banana
{

    public static function createTask($image_url)
    {
        try {
            $client = new Client();

            $response = $client->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-goog-api-key' => 'AIzaSyCYQeQhcRicBNWZqcFVITbedvEJAmXYeG8'
                ],
                'json' => [
                    'contents' => [
                        'parts' => [
                            [
                                'text' => "Explain how AI works in a few words"
                            ]
                        ]
                    ]
                ]
            ]);

            return $response;
        }catch (\Exception $e){
            abort($e->getMessage());
        }
    }
}