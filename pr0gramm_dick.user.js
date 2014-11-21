// ==UserScript==
// @name        pr0gramm.com Dick by Seglor
// @namespace   https://github.com/Seglormeister/Pr0gramm.com-by-Seglor
// @author		Seglormeister
// @description Improve pr0gramm mit Fullscreen wörk
// @include     http://pr0gramm.com/*
// @version     1.5.3
// @grant       none
// @require		http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js
// @updateURL   https://github.com/Seglormeister/Pr0gramm.com-by-Seglor/raw/master/pr0gramm_dick.user.js
// ==/UserScript==

(function() {


var spacepressed = false;
var wheelLast = 0;
/****/// CSS und Kommentarbox links
    

		var high = $(window).height()-51;
		var highitemimage = $(window).height()-200;
		var highcontainer = $(window).height()-52;
		var widthitemimage = $(window).width()-600;
		
    var css = '#upload-form input[type="submit"] { position:relative; top: 420px; left: 350px; }'+
	'.tags { padding-left:3px; width:100%;} div.item-tags { padding: 4px 0 8px 14% !important;} div.tagsinput { position:absolute; } input[value="Tags speichern"],input[value="Abbrechen"] { float:right; }'+
	'.comments-large-rectangle { height:auto; position:px; width:280px; right:0;top:0; position:relative; } .comments-large-rectangle > a > img { width: 280px; } '+
	'#footer-links {z-index:200;} div.item-tags { padding: 4px 0 8px 20%;} div.item-info { text-align:center;} '+
	'#zahlbreite { color: #FFFFFF; margin: 27px 0 0 15px; float: left;} div.stream-row { clear:right; }'+
				
'.ui-widget-content {border: 1px solid #AAAAAA;color: #222222;}'+
'.ui-slider { position: relative; text-align: left;}'+
'.ui-slider-horizontal { height: 0.8em;}'+
'.ui-corner-all {  border-radius: 4px;}'+
'.ui-slider-horizontal .ui-slider-range { height: 100%; top: 0;}'+
'.ui-state-default, .ui-widget-content .ui-state-default, .ui-widget-header .ui-state-default {'+
'background: #E6E6E6; border: 1px solid #D3D3D3; color: #555555; font-weight: normal;}'+
'.ui-slider-horizontal .ui-slider-handle { margin-left: -0.6em; top: -0.3em;}'+
'.ui-slider .ui-slider-handle { cursor: default; height: 1.2em; position: absolute; width: 1.2em; z-index: 2;}'+
'#slider { float: left; clear: left; width: 300px; margin: 30px 15px 5px; }#slider .ui-slider-range { background: #EE4D2E; } #slider .ui-slider-handle { border-color: #EE4D2E; }'+
'@media screen and (max-width:1400px){ div#head {margin: 0 0 0 0 !important;} '+
				
'div#page {margin: 0 0 0 0 !important;} .item-comments {width: 24% !important;}} '+
'#head { z-index:200; } #stream-next, #stream-prev { z-index:122; top:350px; } '+
'.item-image{max-height:460px;} .item-comments {\n  position: fixed !important;\n  '+
'top: 0;\n  left: 0;\n \n  width: 300px;\n  height: 100vh;\n  max-height: 100vh;\n  '+
'overflow-y: auto;\n  overflow-x: hidden;\n}\n \n.item-comments textarea.comment {\n  '+
'resize: none;\n}\n \ndiv.comment-box > div.comment-box {\n    '+
'background: none repeat scroll 0 0 rgba(0, 0, 0, 0.1);\n    padding: 0 0 0 6px;\n}'+

'#user-admin, #user-ban { top: 126px; }'+
'#head-content { background-color: #161618 !important; border-bottom: 2px solid #232326;}'+
'.pane, .pane-head, .tab-bar, .user-stats, .in-pane { width: 792px; margin: 0 auto !important;}'+
'#random { padding-left: 7px;} #random:hover { color: #ee4d2e; cursor: pointer;}'+
						'body { overflow-x:hidden; overflow-y: auto; }'+
						'#page { width: 100% !important; position: absolute !important;}'+
                      '#head { width: 100% !important }'+
                      '.item-comments { top: 51px !important; width: 312px !important; height: '+high+'px !important;}' +
                                '.item-container-content { padding-left: 200px !important; display: table-cell; vertical-align: middle;}'+
                                'div.item-container { background: rgba(0, 0, 0, 0.9) !important; position: fixed !important; display: table; height: '+highcontainer+'px !important; width: 100% !important; }'+
                                'div.stream-row { clear: none !important; margin-left: 5px; }'+
                                '#main-view { max-width: 101% !important; width: 101% !important; }'+
                                '.user-info { margin: 20px 30px 0 0 !important; }'+
                                '#pr0gramm-logo { margin-left: 15px !important; }'+
                                '.item-pointer { display: none !important; }'+
								'#stream-prev {left: 312px !important; right: auto !important;}'+
								'#stream-next { right: 0 !important; left: auto !important;}'+
								'span.flags {padding-left: 120px; float: none !important;}'+
								'.item-fullsize-link { right: 10px !important;}'+
								'.item-container-content img { max-height: '+highitemimage+'px !important;}'+
								'.item-image { max-height: '+highitemimage+'px !important; max-width: '+widthitemimage+'px !important;}'+
								'video.item-image { width: auto;}'+
				'.video-position-bar { max-width: '+widthitemimage+'px !important; left: 200px !important;}'+
                'div.item-tags { padding: 4px 0 8px 240px !important;}'+
								'.head-menu { left: 200px; position: absolute;}'+
								'div.in-pane { margin-left: -5px}'+
								'#footer-links { top: 20px; right: 250px;}'+
								'.item-image-wrapper { max-width: '+widthitemimage+'px; margin: 0px auto;}'+
                'div.item-vote { left: 180px;}'+
				'::-webkit-scrollbar { width: 10px;} ::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.3); -webkit-border-radius: 7px; border-radius: 7px;}'+ 
        '::-webkit-scrollbar-thumb { border-radius: 7px; -webkit-border-radius: 7px; background: #949494; -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.5); }';
	
	
    if (typeof GM_addStyle != "undefined") {
        GM_addStyle(css);
    } else if (typeof PRO_addStyle != "undefined") {
        PRO_addStyle(css);
    } else if (typeof addStyle != "undefined") {
        addStyle(css);
    } else {
        var node = document.createElement("style");
        node.type = "text/css";
        node.appendChild(document.createTextNode(css));
        var heads = document.getElementsByTagName("head");
        if (heads.length > 0) {
            heads[0].appendChild(node); 
        } else {
            document.documentElement.appendChild(node);
        }
    }

	
function update(e) {
	/*	
	// nur in Uploads
	if ($("div.item-container").length) {
		
		//$('.item-container').fadeIn();
		$(".item-container").attr( 'id', 'bild' );
		
		var positionX = 0,         
        positionY = 0;
		var pageElement = document.getElementById('bild');
		positionX += pageElement.offsetLeft;        
        positionY += pageElement.offsetTop;
		//alert(positionX+' '+positionY);    	
        //window.scrollTo(positionX, positionY-130); 
	}
	*/
}


	setInterval(function() {
		
		if ($('.item-image').length) {
			
			// + bei resized Bildern
			if (!$('.item-fullsize-link').length) {
				var imgu = document.getElementsByClassName('item-image')[0]; 
				if (imgu.naturalHeight > 460) {
					var link = imgu.getAttribute('src');
					$('.item-image-wrapper').append('<a class="item-fullsize-link" target="_blank" href="'+link+'" style="">+</a>');
				}
			}
			var stil = document.getElementsByTagName('html')[0];
			stil.style.overflow='hidden';

		}else{
			var stil = document.getElementsByTagName('html')[0];
			stil.style.overflow='visible';	
		}
    }, 100);


$('#stream-next').click(function() {
	update();
});
$('#stream-prev').click(function() {
	update();
});
		
		
// Space Vergrößerung und links/rechts Bildwechsel
document.addEventListener("keydown", keydown, false);
	
function keydown(event) {
	if (event.keyCode == '37' || event.keyCode == '39') {
		update();
	}else if (event.keyCode == '32') {
		
		// falls textarea aktiv
		var el = document.activeElement;
		if (el && (el.tagName.toLowerCase() == 'input' && el.type == 'text' || el.tagName.toLowerCase() == 'textarea')) {
			return;
		}
		
		// Bild mit Space vergrößern
		if ($('.item-image').length != 0) {
			event.preventDefault();
			event.stopPropagation();
		
			if (!spacepressed && $("div.item-container").length) {
				$(".item-image").css( 'max-height', '100%' );
                $(".item-image").css( 'cursor', 'move' );
				spacepressed = true;
			}else{
				$(".item-image").css( 'max-height', '460px' );
                $(".item-image").css( 'cursor', 'pointer' );
				spacepressed = false;
			}
		}
	}
}


// Image Scroll

    // Firefox
document.addEventListener("DOMMouseScroll", handleWheel, false);
	// IE9, Chrome, Safari, Opera
document.addEventListener("mousewheel", handleWheel, false);
	// IE 6/7/8
 if(!document.addEventListener) {
	document.attachEvent("onmousewheel", handleWheel);
}

function handleWheel(event) {

    if ($("div.item-container").length) {
		var coms = document.getElementsByClassName("item-comments");
		if (coms.length != 1 || isHover(coms[0])) {
			return;
		}
		
        event.preventDefault();
        event.stopPropagation();
        event.returnValue=false;

		var wheelWait = 200;
		var time = (new Date()).getTime();
		var msec = time - wheelLast;
		wheelLast = time;
		if (msec < wheelWait) {
			return;
		}

	    var delta = 0;
        if (!event) 
                event = window.event;
        if (event.wheelDelta) { 
                delta = event.wheelDelta/120;
        } else if (event.detail) { 
                delta = -event.detail/3;
        }
		
        if(delta<0){
            $('#stream-next').click();
		}else{
            $('#stream-prev').click();
		}
		update();
	}
}

function isHover(e) {
if (!e) return false;
    return (e.parentElement.querySelector(':hover') === e);
}



})();
