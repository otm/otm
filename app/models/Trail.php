<?php

namespace app\models;

class Trail extends \lithium\data\Model {

	public $belongsTo = array(
		'User' => array('key' => array('uploader' => 'id'))
	);


	public function _init() {
        parent::_init();

       	$created = function($self, $params, $chain){
			$entity = & $params['entity'];

			if (!$entity->exists()){
				$entity->created = date("Y-m-d H:i:s");
			}
			return $chain->next($self, $params, $chain);
		};

		//Trail::applyFilter('save', $created);
    }

	public static function inEnvelope($envelope) {
		return Trail::find('all', array(
			'fields' => array(
				'id', 
				'name',
				'description',
				'grade',
				'distance',
				/*
				'distanceAscend',
				'distanceDescend',
				'descent',
				'ascent',
				'startPoint', 
				'endPoint', 
				'kmPoints', 
				'highestPoint', 
				'lowestPoint',
				*/
				'polyline'
				
			),
			'conditions' => array(
				'swlat' => array('<' => $envelope->ne->lat),
				'nelat' => array('>' => $envelope->sw->lat),
				'swlng' => array('<' => $envelope->ne->lng),
				'nelng' => array('>' => $envelope->sw->lng)
			),
			'limit' => 100
		));
	}

	 
	public function getLength($entity, $metric = 'auto'){
		if ($metric == 'auto'){
			$metric = ($entity->distance < 10000) ? 'm' : 'km';
		}

		switch ($metric){
			case 'm':
				return round($entity->distance);
			case 'km':
				return round($entity->distance/1000, 2);		
			default:
				return '-';
		}	
	}
}
?>