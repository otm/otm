<?php
// Don't create a topbar menu if it's 
if (!isset($topbarMenu) || $topbarMenu === false){
	return "";
}

if (!isset($active)) {
	$active = '';
}

$menu = array(
	"home" => array(
		"label" => "Map",
		"href" => "/map",
		"active" => ($active == 'map')
	),
	"mytrails" => array(
		"label" => "My Trails",
		"href" => "/mytrails",
		"active" => ($active == 'mytrails')
	),
	"contribute" => array(
		"label" => "Contribute",
		"href" => "/contribute",
		"active" => ($active == 'contribute')
	)
);

?>
            <ul class="nav">
            	<?php foreach ($menu as $item) { ?>
            		<li <?php echo ($item['active'])?'class="active"':''; ?> >
            		<a href="<?=$item['href']?>"><?=$item['label']?></a></li>
            	<?php } ?>
            </ul>
