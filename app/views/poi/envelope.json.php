{
	"pois": [ 
		<?php 
		$count = 0;
		foreach ($pois as $poi){ 
		if ( $count ) { echo ", "; } else { $count++; }
		?>
		{
			"id": <?=$poi->id?>, 
			"name": "<?=$poi->name?>", 
			"description": "<?=str_replace(array("\r", "\r\n", "\n"), '', nl2br(htmlspecialchars($poi->description)))?>", 
			"lat": <?=$poi->lat?>, 
			"lng": <?=$poi->lng?>, 
			"type": "<?=$poi->type?>"
		}
		<?php } /* end foreach($trails) */ ?>
	]
}