<?php

namespace app\utils;

use app\admin\logic\ConfigLogic;

class DateTool
{
    public static function calculateDiffDays($date1, $date2)
    {
        $date1 = new \DateTime($date1);
        $date2 = new \DateTime($date2);
        $diff = $date1->diff($date2);
        return $diff->days;
    }

    public static function calculateDiffTime($date1, $date2)
    {
        $date1 = new \DateTime($date1);
        $date2 = new \DateTime($date2);

        return $date1->getTimestamp() - $date2->getTimestamp();
    }

    public static function maxConfigTime($field)
    {
        $config = ConfigLogic::getConfig();
        $config_time = $config[$field];

        return ceil($config_time * 86400);
    }
}