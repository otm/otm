<?php

namespace app\models;

class User extends \lithium\data\Model {

	public $hasMany = array(
		'Trail' => array('key' => array('id' => 'uploader')),
	);
}

?>