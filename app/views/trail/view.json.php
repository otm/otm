{
	"id": <?=$trail->id?>,
	"name": "<?=$trail->name?>",
	"grade": <?=$trail->grade?>,
	"distance": <?=$trail->distance?>,
	"distanceAscend": <?=$trail->distanceAscend?>,
	"distanceDescend": <?=$trail->distanceDescend?>,
	"ascent": <?=$trail->ascent?>,
	"descent": <?=$trail->descent?>,
	"points": {
		"start": <?=$trail->startPoint?>,
		"end": <?=$trail->endPoint?>,
		"highest": <?=$trail->highestPoint?>,
		"lowest": <?=$trail->lowestPoint?>,
		"km": <?=$trail->kmPoints?>
	},
	"y": [
		{
			"title": "Elevation",
			"unit": "m",
			"data": <?=$trail->eleArray?>
		}
	],
	"x": [
		{
			"title": "Distance",
			"unit": "m",
			"data": <?=$trail->distArray?>
		}
	],
	"polyline": <?=$trail->polyline?>,
	"envelope": {
		"sw": {
			"lat": <?=$trail->swlat?>,
			"lng": <?=$trail->swlng?>
		},
		"ne": {
			"lat": <?=$trail->nelat?>,
			"lng": <?=$trail->nelng?>
		}
	},
	"created": {
		"date": "<?=$trail->dateAdded?>",
		"user": {
			"id": <?=$trail->uploader?>,
			"username": "<?=$trail->user->username?>"
		}
	},
	"updated": {
		"date": "<?=$trail->lastUpdate?>",
		"user": {
			"id": <?= $trail->mod_user_id?$trail->mod_user_id:$trail->uploader?>
		}
	}

}