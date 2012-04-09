<?php

namespace app\extensions\geo;

class point{
	public $lng = null; // lng/x/lon
	public $lat = null; // lat/y
	private $xml = null; // reference to the xml object
	private $vars = array();
	
	public function __construct($lat, $lng){
		$this->set($lat, $lng);
	}
	
	public function __get($key){
		if ($key == 'y' || $key == 'lat'){
			return $this->lat;
		}
		elseif ($key == 'x' || $key == 'lng' || $key == 'lon')
			return $this->lng;
		elseif ($key == 'xml')
			return $this->xml;
		elseif (isset($this->vars[$key]))
			return $this->vars[$key];
			
		return null;
	}
	
	public function __set($key, $value){
		if ($key == 'y' || $key == 'lat')
			$this->lat = (double)$value;
		elseif ($key == 'x' || $key == 'lng' || $key == 'lon')
			$this->lng = (double)$value;
		elseif ($key == 'xml')
			$this->xml = $value;
		else{
			$this->vars[$key] = $value;
		}
	}
	
	public function exists($key){
		return isset($this->vars[$key]);
	}
	
	public function set($lat, $lng){
		$this->lng = (double)$lng;
		$this->lat = (double)$lat;				
	}

	public function __toString(){
		return print_r($this->toArray(), true);
		//return 'lat: ' . $this->lat . ', lng: ' . $this->lng; 
	}
	
	public function toArray($onlyLatLng = false){
		if ($onlyLatLng){
			return array(
				'lat' => $this->lat,
				'lng' => $this->lng
			);
		}
		else{
			$this->vars['lat'] = $this->lat;
			$this->vars['lng'] = $this->lng;
			return $this->vars;
		}	
	}
	public function json(){
		return json_encode($this->toArray());	
	}
}
?>