<?php

namespace app\models;

class Poi extends \lithium\data\Model {

	//protected $_meta = array('source'=>'poi');

	public $belongsTo = array(
		'User' => array('key' => array('user_id' => 'id'))
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

		//Poi::applyFilter('save', $created);
    }

	public static function inEnvelope($envelope) {
		return Poi::find('all', array(
			'conditions' => array(
				'lat' => array('<' => $envelope->ne->lat),
				'lat' => array('>' => $envelope->sw->lat),
				'lng' => array('<' => $envelope->ne->lng),
				'lng' => array('>' => $envelope->sw->lng)
			),
			'limit' => 100
		));
	}
}

?>