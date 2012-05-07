<?php

use lithium\net\http\Router;

$this->title('opentrailmap.net');

//text-shadow: #777 0 0 8px;

?>
<div class="container">

  <!-- Main hero unit for a primary marketing message or call to action -->
  <div style="position: relative" class="hero-unit">
  	<img src="/img/trail.jpg" />
    <div style="
      color: whiteSmoke;
      position: absolute;
      top: 293px;
      left: 15px;
      font-size: 65px;
      line-height: 35px;
    ">Trailmap<br/><span style="
      font-size: 27px;
    "
    >Outdoor maps created by the community</span></div>
  </div>

  <!-- Example row of columns -->
  <div class="row">
    <div class="span4">
      <h2>Discover</h2>
       <p>
        Free outdoor maps created by the community. Find new trails, download the trails to your GPS and 
        create your own routes.        
       </p>
      <p><a class="btn" href="<?=Router::match('Trail::index')?>">Map &raquo;</a></p>
    </div>
    <div class="span4">
      <h2>Share</h2>
      <p>
        Track your rides and contribute to the map. The trails you now are new adventures for others.
      </p>
      <p><a class="btn" href="#">Contribute &raquo;</a></p>
	</div>
	<div class="span4">
     <h2>Ride</h2>
     <p>
      Take opentrailmap with you on your rides. All trails in Google Maps on both Android, iPhone and Window Phone 7.
     </p>
      <p><a class="btn" href="#">Google Maps Integration &raquo;</a></p>
    </div>
  </div>

  <hr>

  <footer>
    <p>&copy; Nils Lagerkvist 2012</p>
  </footer>

</div> <!-- /container -->