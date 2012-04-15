{
	"trails": [ 
		<?php 
		$count = 0;
		foreach ($trails as $trail){ 
		if ( $count ) { echo ", "; } else { $count++; }
		?>
		{
			"id": <?=$trail->id?>, 
			"name": "<?=$trail->name?>", 
			"description": "<?=str_replace(array("\r", "\r\n", "\n"), '', nl2br(htmlspecialchars($trail->description)))?>",
			"grade": <?=$trail->grade?>, 
			"distance": <?=$trail->distance?>,
			"polyline": <?=$trail->polyline?>
		}
		<?php } /* end foreach($trails) */ ?>
	]
}