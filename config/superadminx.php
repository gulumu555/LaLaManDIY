<?php
/**
 * This file is part of SuperAdminx.
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the MIT-LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @author zy <741599086@qq.com>
 * @link https://www.superadminx.com/
 */

return [
    'version'             => '2.0.1',
    //上传文件的配置
    'file_system'         => [
        //本地》public，阿里云》aliyun，腾讯云》qcloud
        'default' => 'public',
        //阿里云，需要安装sdk composer require aliyuncs/oss-sdk-php
        'aliyun' => [
			'AccessKeyID' => '',
			'AccessKeySecret' => '',
			//阿里云oss Bucket所在地域对应的Endpoint，debug用外网，否则用内网
			'endpoint' => getenv('DE_BUG') == 'true' ? '//oss-cn-hangzhou.aliyuncs.com' : '//oss-cn-hangzhou-internal.aliyuncs.com',
			//阿里云oss Bucket文件访问地址
			'bucket_url' => 'https://changxiangzhongguo.oss-cn-hangzhou.aliyuncs.com',
			//阿里云oss bucket的名称
			'bucket' => 'changxiangzhongguo',
		],
        //腾讯云，需要安装sdk composer require qcloud/cos-sdk-v5
        'qcloud'  => [
            'SecretId'   => '',
            'SecretKey'  => '',
            'region'     => 'ap-guangzhou',
            //腾讯云cos Bucket文件访问地址也是上传地址，格式“存储桶名称.cos.所属地域.myqcloud.com”
            'bucket_url' => '', 
            //腾讯云cos bucket的名称
            'bucket'     => ''
        ],
    ],
    //网站的url，上传的资源访问的url也在用
    'url'                 => getenv('URL'),
    //api请求中数据是否加解密，需要跟前端的开关对应
    'api_encryptor'       => [
        //开关
        'enable'      => false,
        //不加密的url，上传接口则不加密
        'url'         => ['/admin/File/upload', '/api/File/upload', '/admin/File/download', '/api/File/download'],
        //数据解密私钥，左边不要有空格，百度“rsa密钥在线生成”，需2048位PKCS1格式
        'rsa_private' => <<<EOF
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAkDgd1RAyPBOXwgCLfVqmfNLcRTi3D3O5HxBjGiX9k311XnH+
8jff5C7fGDYyUo6RoPqyF4Bq5rSeccRukk+t9/5Iw8iQdixn+cxRaldPJuXAITau
zMpPNSl5/n2lbvsRyttyrdxdkzsMdVoJ/NvP0Le2QoJy8/NW8ZqRoJMiOoSSkwNg
zmeeljs+cWmqMYyiTcwAPDR7KbgO8+1EOt5+1/d0Sv8zj+KXG/gkClM5Ad9jjkdk
rKweaFKTbu3j9cJR58+E6iBozEdZqhFz2lMiLTUQwo43Bl5Yh/V2aMKeghKh8IVb
2aJnTlmpLnPC4NS1G8izvfQFiOw+o4bpj0aFNQIDAQABAoIBAAsMAVz8rJxlc85s
dELZ2r7c9/placBJQPjcLHsoRdAyX/coDDtJhGDaJkSYgipIuWb3TQT31ThuxWQ5
g665Y74HQFOe3VHv/Nbpi6L1pR55osnogmM1a/PKhYm03iMuICLFxHcE1jYc48tp
ZjJ0M+rs540YqO1+yj4fdOAz5P9OYuDzCMsoua4mI2SmauvixtCLJ2iRE7v+T+gk
z4JvBDp68Qqh8HMyugXkx+D5DdISHaALENHVO0JaJqTEM/m5JAhSvB+YRIJT6FFZ
IfkkW4tnnY5xDkTTA/zYGBZ+/gFTo3gifyaK3y5p1aGsXYttXHjHvtzhXiZmhp0s
k3eflVECgYEAyuTtnXXmYd7j0TMQHosl9xoo+Ky4wkKlnIZ7mu7xR0DF4/RJt8k5
eC2YVg9yra8dRR2bFS0RgyGR0UZzWHNosaBMisMzcUogb0ZZcfLZ/R183FbQeDAz
SeLwdlnE0AnepCzSKQGWqU5FaOadOIYI1cTiYAzRB566aXbqlfHM8FMCgYEAtfeg
LerjT4pFMYm7RpX+6DpEll0TECc5AUuLyfj688qj0bzAv9lD4eiFCxX1nbn6OuNG
4u7f58qoozUvPKxQW3ZJbk3d3eDHhSY+4CF9ZLdv8gVpdrv+I6mAxWIPUtbEk0vc
cJkdmtl5bMY00irqeaVsKJ6P+ALXnrnPFgB0o1cCgYEAsEg5P38JfO14iPHRxofl
o41CHdWL7ZSUaavaxyFl1x+rEETWq+0Ulpse6V8gp1EnoD552OtAdOt80xRf8XDM
fNAm0MWK85qRFb1Mx5lV1vqA2rw/Ar32QfMANAQI4SxCGeirbF9p9I4B9oOwBEVI
ddtLSGK6VuGNW0aryT2+busCgYEAh3tuVKHNStx9NiwBNsXZO9ieVoHH/r/lTpSL
6P4rArb+j9uEe5LtWtb/r8hSznO43n13uuD17qPSOWoQ2JDHZ8HDXJA3P8rrYrSe
HcxxizqU69KhuliwGKdMjCm9lQT46V6TK3alNzTylk1g6JYxbA8BX6DnOlYLak+X
4x7FuRMCgYAzflhitkHhMyVgmkS/InPitLNp1wfqmDSE59akEJmgFWl1mI/Oorbe
LGyC7sgpKZNYRfg6bf6R1J0No9O4QC6NnUjinN7q+A+6ItnlstNyxUwnjMzxh+xz
3Z151d7asy1PcjaKAf0fizFFzTdhhyZFEmjY9a0L9Ix1+D2h93Yfzg==
-----END RSA PRIVATE KEY-----    
EOF,
    ],
    //微信公众号的
    'wechat_gongzhonghao' => [
        'AppID'     => '',
        'AppSecret' => ''
    ],
    //微信小程序的
    'wechat_xiaochengxu'  => [
        'AppID'     => getenv('WECHAT_APPID'),
        'AppSecret' => getenv('WECHAT_APPSECRET'),
    ],
    //微信支付的
    'wechat_pay'          => [
        //商户号
        'mch_id'               => getenv('WECHAT_MCH_ID'),
        //v2商户私钥
        'mch_secret_key_v2'    => '',
        //v3 商户秘钥
        'mch_secret_key'       => getenv('WECHAT_MCH_SECRET_KEY'),
        // 必填-商户私钥 字符串或路径
        // 即 API证书 PRIVATE KEY，可在 账户中心->API安全->申请API证书 里获得
        // 文件名形如：apiclient_key.pem
        'mch_secret_cert'      => config_path('wechat_cert/apiclient_key.pem'),
        // 必填-商户公钥证书路径
        // 即 API证书 CERTIFICATE，可在 账户中心->API安全->申请API证书 里获得
        // 文件名形如：apiclient_cert.pem
        'mch_public_cert_path' => config_path('wechat_cert/apiclient_cert.pem'),

        'serial_no' => getenv('WECHAT_SERIAL_NO'),

        'public_pem_path' => config_path('wechat_cert/pub_key.pem'),
    ],
    //短信配置
    'sms'                 => [
        //凯凌短信
        'sms_uid'         => "",
        'sms_password'    => "",
        //阿里云或小牛短信
        'type'            => 1, //类型，1》阿里云短信，2》小牛云短信
        'accessKeyId'     => '',
        'accessKeySecret' => '',
        'signName'        => '' //签名
    ],
    //jwt权限验证
    'jwt'                 => [
        //token是在header哪个key上获取
        'header_key' => 'token',
        //token存的地方，mysql || redis，需要设置redis及安装扩展https://www.workerman.net/doc/webman/db/redis.html
        'db'         => 'mysql',
        //存token的时候key的前缀，最好用应用名称
        'key_prefix' => 'SuperAdminx',
        //多应用配置
        'app'        => [
            [
                //应用名称，需要唯一
                'name'       => 'admin_pc',
                //生成token的数组里面能代表唯一性的字段
                'key'        => 'id',
                //生成token的字段
                'field'      => ['id', 'name', 'tel'],
                //同一个用户允许登录的终端设备数量
                'num'        => 100,
                //token过期时间，单位秒
                'expires_at' => 24 * 60 * 60,
            ],
            [
                'name'       => 'user_pc',
                'key'        => 'id',
                'field'      => ['id', 'name', 'tel'],
                'num'        => 1,
                'expires_at' => 365 * 24 * 60 * 60,
            ],
        ]
    ]
];
