<?php
	// Translate the json encoded $trail->polyline to a string as per the KML specs.
	// The string should be of format: "lng1,lat1 lng2,lng2 ..."
	$coords = "";
	foreach (json_decode($trail->polyline) as $coord) {
		$coords = $coords . $coord->lng . "," . $coord->lat . " ";
	}

	$kml = new simpleXMLElement('<kml xmlns="http://www.opengis.net/kml/2.2"></kml>');
	$document = $kml->addChild('Document');
	$document->addChild('name',$trail->name);
	$document->addChild('description',$trail->description);

	//Create a lineStyle per possible grade
	//TODO don't display the lineStyle unless actually used
	$grades = array(
		'grade1' => 'ffffffff',
		'grade2' => 'ff00ff00',
		'grade3' => 'ff0000ff',
		'grade4' => 'ffff0000',
		'grade5' => 'ff000000'
	);
	foreach ($grades as $grade => $color) {
		$style = $document->addChild('Style');
		$style->addAttribute('id', $grade);
		$lineStyle = $style->addChild('LineStyle');
		$lineStyle->addChild('color', $color);
		$lineStyle->addChild('width', '2');
	}

	// One Placemark per trail to show
	$placemark = $document->addChild('Placemark');
	$placemark->addChild('name', $trail->name);
	$placemark->addChild('description', $trail->description);
	$placemark->addChild('styleUrl', '#grade' . $trail->grade);
	$lineString = $placemark->addChild('LineString');
	$lineString->addChild('coordinates', $coords);

	// Format the xml so it's not all on one row.
	// The loss in perforamance is negligible as SimpleXML and DOM both ueses
	// libxml, so same underlying object is used for both $kml and $dom. 
	$dom = dom_import_simplexml($kml)->ownerDocument;
	$dom->formatOutput = true;

	echo $dom->saveXML();
?>
