<?php

namespace app\extensions\geo;

use Exception;

// IteratorAggregate interface with the getIterator()
class Envelope{
	protected $pointClass = 'app\extensions\geo\point';
	public $sw = null;
	public $ne = null;
	

	public function __construct($sw, $ne){		
		if (get_class($sw) != $this->pointClass || get_class($ne) != $this->pointClass)
			throw new Exception('Illigal input type' . get_class($this) 
										. "(" . get_class($sw) . ", " . get_class($ne) . ")");
		if ($ne->lat < $sw->lat || $ne->lng < $sw->lng)
			throw new Exception('Illigal bounding box');
		
		$this->ne = new Point($ne->lat, $ne->lng);
		$this->sw = new Point($ne->lat, $ne->lng);

		$this->extend($sw);
	}
	
	/**
	 * extend Enlarges the rectangle so it will include 
	 * the point
	 */	
	public function extend($point){
		if ((double)$point->lng > (double)$this->ne->lng)
			$this->ne->lng = $point->lng;
		if ((double)$point->lat > (double)$this->ne->lat)
			$this->ne->lat = $point->lat;
		if ((double)$point->lng < (double)$this->sw->lng)
			$this->sw->lng = $point->lng;
		if ((double)$point->lat < (double)$this->sw->lat)
			$this->sw->lat = $point->lat;
	}
	
	public function toArray(){
		return array('sw' => $this->sw->toArray(), 'ne' => $this->ne->toArray());	
	}

	public function json(){
		return json_encode($this->toArray());	
	}

}