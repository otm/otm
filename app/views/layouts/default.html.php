<?php

use lithium\core\Environment;

// Set dynamic part of header
$envWarn = Environment::is('production')?'':' (' . Environment::get() . ')';

// Set class on body
$bodyClass = "";
if (isset($this->preventOverflow) && $this->preventOverflow){
	$bodyClass = 'class="no-y-overflow"';
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
	<?php echo $this->html->charset(), "\n"; ?>
	<title><?php echo $this->title(), $envWarn; ?></title>
	<?php if (Environment::is('development')) { ?>
		<link rel="stylesheet/less" type="text/css" href="/less/bootstrap.less" />
		<link rel="stylesheet/less" type="text/css" href="/less/responsive.less" />
		<?php echo $this->html->script('bootstrap.src.js'), "\n"; ?>
		<?php echo $this->html->script('/build/js/opentrailmap.js'), "\n"; ?>
		<?php echo $this->html->script('less-1.3.0.min.js'), "\n"; ?>

	<?php } ?>
	<?php if (!Environment::is('development')) { ?>
		<?php echo $this->html->style(array('bootstrap', 'bootstrap-responsive')); ?>
		<?php echo $this->html->script('bootstrap.src.js'); ?>
		<?php echo $this->html->script('opentrailmap.src.js'); ?>
	<?php } ?>
	<?php echo $this->html->script('http://www.google.com/jsapi?key=ABQIAAAA3GD9b7sQbg_iv8CVdwFyYRS7GHhSvHXAquCqRAoDOuo0TckwYhRSyVfoaCp8E8vExDHiOLhXsIw6fA'); ?>
	<?php echo $this->scripts(); ?>
	<?php echo $this->html->link('Icon', null, array('type' => 'icon')); ?>

	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">

	<!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

	<!-- Le fav and touch icons -->
	<link rel="shortcut icon" href="/ico/favicon.ico">
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="/ico/apple-touch-icon-114-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="/ico/apple-touch-icon-72-precomposed.png">
	<link rel="apple-touch-icon-precomposed" href="/ico/apple-touch-icon-57-precomposed.png">
  </head>

  <body <?=$bodyClass?>>

	<div class="navbar navbar-fixed-top">
	  <div class="navbar-inner">
		<div class="container-fluid">
		  <a class="btn btn-navbar"  data-trigger="toggleReveal" data-togglereveal-options="'target':'!div > .nav-collapse'" data-toggle="collapse" data-target=".nav-collapse">
			<span class="icon-bar"></span>
			<span class="icon-bar"></span>
			<span class="icon-bar"></span>
		</a>
		<a class="brand" href="/">open<span class="grey">trailmap</span></a>
		<div class="nav-collapse">
			<?php echo $this->_render('element', 'topbarMenu'); ?>
			<ul class="nav pull-right" data-behavior="BS.Dropdown">
				<li class="dropdown">
					<a href="#" class="dropdown-toggle">nils<b class="caret"></b></a>
					<ul class="dropdown-menu tb-dropdown">
						<li><a>profile</a></li>
						<li><a>logout</a></li>
					</ul>
				</li>
			</ul>
			<p class="navbar-text pull-right"><a href="#">Login</a></p>
		  </div><!--/.nav-collapse -->
		</div>
	  </div>
	</div>

	<?php echo $this->content(); ?>
	<!-- Le javascript
	================================================== -->
	<!-- Placed at the end of the document so the pages load faster -->
	<?php if (Environment::is('production')){ ?>
	<script type="text/javascript">
		var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
		document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
	</script>
	<script type="text/javascript">
		try {
			var pageTracker = _gat._getTracker("UA-12982256-2");
			pageTracker._trackPageview();
		} catch(err) {}
	</script>
	<?php } ?>

	<script>
    var behavior = new Behavior().apply(document.body);
    var delegator = new Delegator({
      getBehavior: function(){ return behavior; }
    }).attach(document.body);
  	</script>

  </body>
</html>
