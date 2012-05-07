<?php
/*
$$('.sidebar .scrollpanel')[0].setStyle('top', $$('.sidebar .panel')[0].getSize().y)

*/
?>
<div class="sidebar">
	<div class="sidebar-instance" style="
		position: absolute;
		height: 100%;
		right: 0;
		border-left: 1px #DDD solid;">
		<div class="panel"> 
			<div class="topbar">
				<div class="arrow-right-btn"><i class="carret-right"></i></div>
				<div class="pull-right"><a id="searchbtn" href="#">Search</a></div>
			</div>
			<div class="search toggle-off">
				<!-- $$('.sidebar .panel .searchbar')[0].slide('out');  -->
				<form class="well form-search">
					<input type="text" class="input-144 search-query" placeholder="Location, Country">
					<button type="submit" class="btn"><i class="icon-search"></i> Search</button>
				</form>
			</div>
		</div> <!-- panel -->
		<div class="trailpane scrollpanel">	<!-- set scrollpanel top with $$('.sidebar .panel')[0b].getSize().y-->
				<div class="trail-info-short">
					<h3 class="red">
						Stigens namn
					</h3>
					<div class="star"></div>
					<p>En bit av stigens beskrivning...</p>     
					<p class="subinfo"><a href="#">3 kommentarer</a> - <a href="#">GPX</a></p>     
				</div>
				<div class="trail-info-short">
					<h3 class="green">
						Stigens namn
					</h3>
					<div class="star"></div>
					<p>En bit av stigens beskrivning...</p>
					<p class="subinfo"><a href="#">0 kommentarer</a> - <a href="#">GPX</a></p>     
				</div>
				<div class="trail-info-short">
					<h3 class="blue">
						Stigens namn
					</h3>
					<div class="star"></div>
					<p>En bit av stigens beskrivning...</p>     
					<p class="subinfo"><a href="#">14 kommentarer</a> - <a href="#">GPX</a></p>     
				</div>
				<div class="trail-info-short">
					<h3 class="black">
						Stigens namn
					</h3>
					<div class="star"></div>
					<p>En bit av stigens beskrivning...</p>     
					<p class="subinfo"><a href="#">14 kommentarer</a> - <a href="#">GPX</a></p>     
				</div>
		</div> <!-- trail-pain -->
	</div> <!-- sidebar-instance -->
</div> <!-- sidebar -->