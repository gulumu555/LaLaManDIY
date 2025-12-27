<?php

return [
    'client' => [
        'ak' => getenv('TOS_AK'),
        'sk' => getenv('TOS_SK'),
        'region' => getenv('TOS_REGION'),
        'endpoint' => getenv('TOS_END_POINT'),
    ],
    'bucket' => getenv('TOS_BUCKET'),
    'ark_api_key' => getenv('TOS_ARK_API_KEY'),
    'ark_model_id' => getenv('TOS_ARK_MODEL_ID'),
];
