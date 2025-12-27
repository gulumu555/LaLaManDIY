<?php

return [
    'default' => 'kuaidi100',
    'holder' => [
        'kuaidi100' => [
            'driver' => \Shopwwi\WebmanExpress\Adapter\KuaiDi100AdapterFactory::class,
            'api_url' => 'https://poll.kuaidi100.com/poll/query.do',
            'app_id' => 'D56B5DB072A041E5D628C4710D22B684', //customer
            'app_key' => 'ceKHGqpZ8737' //授权KEY
        ],
        'kdniao' => [
            'driver' => \Shopwwi\WebmanExpress\Adapter\KdNiaoAdapterFactory::class,
            'api_url' => 'https://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx', //测试地址 http://sandboxapi.kdniao.com:8080/kdniaosandbox/gateway/exterfaceInvoke.json
            'app_id' => '',
            'app_key' => ''
        ],
        'showapi' => [
            'driver' => \Shopwwi\WebmanExpress\Adapter\ShowApiAdapterFactory::class,
            'api_url' => 'https://route.showapi.com/2650',
            'app_id' => '', //showapi_appid
            'app_key' => '' //secret
        ]
    ]
];