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
		

		$trail = Trail::find('first', array(
			'conditions' => array('Trail.id' => $this->request->id),
			'with' => array('User')
		));
		
		if (!$trail){
			throw new \lithium\net\http\RoutingException('The trail does not exists', 404);
			// throw new \lithium\action\DispatchException('The trail does not exists', 404);
		}

		// Use custom json encoder through a view
		Media::type('json', 'application/json', array(
			'view' => 'lithium\template\View', 
			'layout' => null,
			'template' => null
		));
		return compact('trail');
	}

	public function envelope(){
		/*
		Collection::formats('json', function($collection, $options) {
			return json_encode($collection->to('array'));
		});
		*/
		Media::type('json', 'application/json', array(
			'view' => 'lithium\template\View', 
			'layout' => null,
			'template' => null
		));
		$swpoint = new Point($this->request->query['swlat'], $this->request->query['swlng']);
		$nepoint = new Point($this->request->query['nelat'], $this->request->query['nelng']);
		$envelope = new Envelope($swpoint, $nepoint);
		$trails = Trail::inEnvelope($envelope);
		/*
		$trails->each(function($ent) use (&$count){
			$count++;
			$ent->polyline = json_decode($ent->polyline);
			return $ent;
		});
		*/
		return compact('count', 'trails');
	}



	public function to_string() {
		return "Hello World";
	}

	public function to_json() {
		return $this->render(array('json' => 'Hello World'));
	}
}

?>