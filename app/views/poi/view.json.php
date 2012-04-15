{
	"id": <?=$poi->id?>,
	"name": "<?=$poi->name?>",
	"description": "<?=$poi->description?>", 
	"lat": <?=$poi->lat?>,
	"lng": <?=$poi->lng?>,
	"type": "<?=$poi->type?>",
	"image": {
		"id": <?=$poi->image_id?> 
	},
	"created": {
		"date": "<?=$poi->dateAdded?>",
		"user": {
			"id": <?=$poi->user->id?>, 
			"username": "<?=$poi->user->username?>"
		}
	}
}