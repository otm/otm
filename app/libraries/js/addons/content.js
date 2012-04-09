
/**
* extLinks
*  
* Make links open in external window
* <a href="..." rel="external">link</a>
*/
function extLinks(){
	$$('a[rel=external]').each(function(el){
		el.setProperty('target', '_blank');
	})
}