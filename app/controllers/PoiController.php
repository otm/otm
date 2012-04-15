<?php

namespace app\controllers;

use app\models\Poi;
use lithium\net\http\Media;
use app\extensions\geo\Envelope;
use app\extensions\geo\Point;

class PoiController extends \lithium\action\Controller {

	/**
	 * Display a table of all POIs
	 */
	function index(){
		$poi = Poi::find(7);
		echo $poi->name;
		exit;
	}

	function view(){
		$poi = Poi::find('first', array(
			'conditions' => array('Poi.id' => $this->request->id),
			'with' => array('User')
		));
		
		if (!$poi){
			throw new \lithium\net\http\RoutingException('The POI does not exists', 404);
			// throw new \lithium\action\DispatchException('The trail does not exists', 404);
		}

		// Use custom json encoder through a view
		Media::type('json', 'application/json', array(
			'view' => 'lithium\template\View', 
			'layout' => null,
			'template' => null
		));
		return compact('poi');
	}

	public function envelope(){
		
		Media::type('json', 'application/json', array(
			'view' => 'lithium\template\View', 
			'layout' => null,
			'template' => null
		));
		$swpoint = new Point($this->request->query['swlat'], $this->request->query['swlng']);
		$nepoint = new Point($this->request->query['nelat'], $this->request->query['nelng']);
		$envelope = new Envelope($swpoint, $nepoint);
		$pois = Poi::inEnvelope($envelope);
		
		return compact('pois');
	}



	public function to_string() {
		return "Hello World";
	}

	public function to_json() {
		return $this->render(array('json' => 'Hello World'));
	}
}

?>