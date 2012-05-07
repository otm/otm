<?php ob_start(); ?>
<script type="text/javascript">
window.addEvent("domready", function(){
    google.load("maps", "3", {
        'other_params': 'sensor=false', 
        'callback': otm.viewTrailsFluid
    });
});
</script>
<?php 
$this->scripts(ob_get_clean());
$this->preventOverflow = true;
?>


<?php echo $this->_render('element', 'sidebar'); ?>
<div id="map" class="content">
    <div id="map_canvas" style="height: 100%; width: 100%"></div>
    <div id="ds">
        <div id="ds-h">
            <div class="ds h1 o1"></div>
            <div class="ds h2 o2"></div>
            <div class="ds h3 o3"></div>
            <div class="ds h4 o4"></div>
            <div class="ds h5 o5"></div> 
        </div>
        <div id="ds-v"> 
            <div class="ds v1 o1 panel-width-start"></div>
            <div class="ds v2 o2 panel-width-start"></div>
            <div class="ds v3 o3 panel-width-start"></div>
            <div class="ds v4 o4 panel-width-start"></div>
            <div class="ds v5 o5 panel-width-start"></div>
        </div>
    </div>                       
</div>