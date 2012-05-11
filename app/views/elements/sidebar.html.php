<?php
/*
$$('.sidebar .scrollpanel')[0].setStyle('top', $$('.sidebar .panel')[0].getSize().y)

				<div class="trail-info-short">
					<h3 class="red">
						Stigens namn
					</h3>
					<div class="star"></div>
					<p>En bit av stigens beskrivning...</p>     
					<p class="subinfo"><a href="#">3 kommentarer</a> - <a href="#">GPX</a></p>     
				</div>

*/
?>
<div id="sidebar" class="sidebar">
	<div class="sidebar-instance active" style="
		position: absolute;
		height: 100%;
		right: 0;
		border-left: 1px #DDD solid;">
		<div class="panel"> 
			<div class="topbar">
				<div class="hide-sidebar arrow-right-btn"><i class="carret-right"></i></div>
				<div class="pull-right"><a id="searchbtn" href="#">Search <b class="caret"></b></a></div>
			</div>
			<div class="search toggle-off">
				<form id="mapLocationSearch" class="well form-search clear">
					<input id="address" type="text" class="input-144 search-query" placeholder="Location, Country">
					<button type="submit" class="btn"><i class="icon-search"></i> Search</button>
				</form>
			</div>
		</div> <!-- panel -->
		<div id="trailpanel" class="trailpane scrollpanel">	
		</div> <!-- trail-pain -->
	</div> <!-- sidebar-instance -->
</div> <!-- sidebar -->