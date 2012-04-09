<?php

namespace app\controllers;

use app\models\Poi;


class PoiController extends \lithium\action\Controller {
	function index(){
		$poi = Poi::find(7);
		echo $poi->name;
		exit;
	}
}

?>