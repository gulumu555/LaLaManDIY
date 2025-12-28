<?php
namespace app\model;

use think\Model;

class SeedDreamStyle extends Model
{
    // Table name
    protected $table = 'app_seed_dream_styles';

    // Auto write timestamp
    protected $autoWriteTimestamp = true;

    // JSON fields to cast
    protected $json = ['reference_images', 'params'];

    // Cast JSON to array
    protected $jsonAssoc = true;
}
