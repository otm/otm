<?php

namespace app\controllers;

use packager\Packager;

//require('app/libraries/js/packager/packager.php');

class BuildController extends \lithium\action\Controller {

	public function target(){
		
	}

	public function css(){
		
	}

	public function js() {
		if (!$this->request->file){
			throw new \lithium\action\DispatchException('Missing javascript build');
		}

		switch ($this->request->file) {
			case 'opentrailmap.js':
				$pkg = new Packager(array(
					'../../app/libraries/js/otm/',
					'../../app/libraries/js/simplemodal/'	
				));
				$all = $pkg->get_all_files('OpenTrailmap');
				header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
				header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
				return $pkg->build_from_files($all);
				break;
			
			default:
				throw new \lithium\action\DispatchException("Unknown javascript build `{$this->request->file}`");
				break;
		}

		//return $this->render(array('layout' => false));
	}
}


	
?>