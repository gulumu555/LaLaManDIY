<?php

namespace app\api\controller;

class Meshy
{
    // 此控制器是否需要登录
    protected $onLogin = false;


    public function notify()
    {

        return success([], 200);
    }
}