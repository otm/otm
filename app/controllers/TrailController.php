<?php

namespace app\controllers;

use app\models\Trail;
use lithium\core\Environment;
use app\extensions\geo\Envelope;
use app\extensions\geo\Point;
use lithium\util\Collection;
use lithium\net\http\Media;

class TrailController extends \lithium\action\Controller {

	public function index() {
		$this->set(array('topbarMenu' => true));
		
		//$trail = Trail::find(4);
		//return compact('trail', 'title');
		//return $this->render(array('layout' => false));
	}

	public function view() {
		Media::type('json', 'application/json', array(
			'view' => 'lithium\template\View', 
			'layout' => null,
			'template' => null
		));
		Media::type('gpx', 'application/text', array(
			'view' => 'lithium\template\View', 
			'layout' => false,
			'template' => false
		));
	
		$trail = Trail::find('first', array(
			'condition' => array('id' => $this->request->id),
			'with' => array('User')
		));
		if ($this->request->type != 'gpx')
			$trail->set(array('gpx' => null));
		return compact('trail');
	}

	public function envelope(){
		/*
		Collection::formats('json', function($collection, $options) {
			return json_encode($collection->to('array'));
		});
		*/
		$swpoint = new Point($this->request->query['swlat'], $this->request->query['swlng']);
		$nepoint = new Point($this->request->query['nelat'], $this->request->query['nelng']);
		$envelope = new Envelope($swpoint, $nepoint);
		$trails = Trail::inEnvelope($envelope);
		
		$trails->each(function($ent){
			$ent->polyline = json_decode($ent->polyline);
			return $ent;
		});
		return compact('trails');
	}



	public function to_string() {
		return "Hello World";
	}

	public function to_json() {
		return $this->render(array('json' => 'Hello World'));
	}
}

?>