// ==UserScript==
// @name        pr0gramm.com Dick by Seglor
// @namespace   https://github.com/Seglormeister/Pr0gramm.com-by-Seglor
// @author		Seglormeister
// @description Improve pr0gramm mit Fullscreen wörk
// @include     http://pr0gramm.com/*
// @version     1.5.5
// @grant       none
// @require		http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js
// @updateURL   https://github.com/Seglormeister/Pr0gramm.com-by-Seglor/raw/master/pr0gramm_dick.user.js
// ==/UserScript==

(function() {


p.View.Stream.Main.prototype.show = function(params) {
        if (params.token) {
            p.mainView.showRegister(params.token);
        }
        if (!params.userName) {
            this.tab = params.tab || 'top';
        } else {
            this.tab = null;
        }
        p.mainView.setTab(this.tab);
        var q = params.userName ? params.userName + ':' + params.userTab : params.tags || '';
        $('#q').val(q.replace('+', ''));
        var newBaseURL = (p._hasPushState ? '/' : '#') +
            (params.userName ? ('user/' + params.userName + '/' + params.userTab + '/') : (this.tab + '/' + (params.tags ? encodeURIComponent(params.tags) + '/' : '')));
        if (newBaseURL == this.baseURL) {
            this.data.params = params;
            var itemHandled = true;
            if (this.data.params.itemId) {
                var $target = $('#item-' + this.data.params.itemId);
                if (!$target.length) {
                    itemHandled = false;
                } else if (this.$currentItem && !this.$currentItem.is($target)) {
                    //$(document).scrollTop($target.offset().top - CONFIG.HEADER_HEIGHT);
                    this.showItem($target);
                }
            } else {
                itemHandled = false;
            }
            if (itemHandled) {
                return;
            }
        }
        this.children = [];
        var options = {};
        if (params.tab === 'top' || (!params.tab && !params.userName)) {
            options.promoted = 1;
        }
        if (params.tags) {
            options.tags = params.tags;
        }
        if (params.userName && params.userTab === 'uploads') {
            options.user = params.userName;
        } else if (params.userName && params.userTab === 'likes') {
            options.likes = params.userName;
            if (params.userName === p.user.name) {
                options.self = true;
            }
        }
        this.stream = new p.Stream(options);
        this.baseURL = newBaseURL;
        this.hasItems = false;
        this.parent(params);
        this.$streamContainer = this.$container.find('#stream');
        this.$container.append(p.View.Base.LoadingAnimHTML);
        this.$itemContainer = null;
        this.itemPrevLink = this.$container.find('#stream-prev');
        this.itemNextLink = this.$container.find('#stream-next');
        this.itemPrevLink.click(this.prev.bind(this));
        this.itemNextLink.click(this.next.bind(this));
    }

p.View.Stream.Main.prototype.showItem = function($item, scrollToFullView) {
        if ($item.is(this.$currentItem)) {
            this.hideItem();
            this._wasHidden = true;
            return;
        }
        var $previousItem = this.$currentItem;
        this.$currentItem = $item;
        var $row = $item.parent();
        var scrollTarget = scrollToFullView ? $row.offset().top - CONFIG.HEADER_HEIGHT + $item.height() + this.rowMargin : $row.offset().top - CONFIG.HEADER_HEIGHT;
        var animate = !(scrollToFullView && this._scrolledToFullView);
        this._scrolledToFullView = scrollToFullView;
        if (this.$itemContainer) {
            var previousItemHeight = this.$itemContainer.find('.item-image').height() || 0;
        }
        if (!$row.next().hasClass('item-container')) {
            var scrollAdjust = 0;
            if (this.$itemContainer) {
                if (this.$itemContainer.offset().top < $item.offset().top) {
                    scrollTarget -= this.$itemContainer.innerHeight() + this.rowMargin * 2;
                }
				
                if (animate) {
                    this.$itemContainer.find('.gpt').remove();
                    this.$itemContainer.slideUp('fast', function() {
                        $(this).remove();
                    });
                } else {
                    this.$itemContainer.remove();
                }
            }
            this.$itemContainer = this.$itemContainerTemplate.clone(true);
            this.$itemContainer.insertAfter($row);
            if (animate && !this.jumpToItem) {
                this.$itemContainer.slideDown('fast');
            } else {
                this.$itemContainer.show();
            }
        }
        var id = $item[0].id.replace('item-', '');
        var itemData = this.stream.items[id];
        var rowIndex = $item.prevAll().length;
        if (this.currentItemSubview) {
            this.currentItemSubview.remove();
        }
        this.currentItemSubview = new p.View.Stream.Item(this.$itemContainer, this);
        this.currentItemSubview.show(rowIndex, itemData, previousItemHeight, this.jumpToComment);
        this.jumpToComment = null;
        this.prefetch($item);
		//alert(scrollTarget);
        if (!this.jumpToItem) {
            if (animate) {
                //$('body, html').stop(true, true).animate({
                //    scrollTop: scrollTarget - this.rowMargin
                //}, 'fast');
            } else {
                //$('body, html').stop(true, true).scrollTop(scrollTarget - this.rowMargin);
            }
        }
        if (!p.mobile) {
            this.itemPrevLink.show();
            this.itemNextLink.show();
        }
}




// Comments sortieren	
p.View.Stream.Comments.prototype.template = '<div class="comments-head"> <span class="pict">c</span> {"Kommentar".inflect(commentCount)} </div> <?js if( !p.mobile ) { ?> <div class="comments-large-rectangle gpt" id="gpt-rectangle-comments" data-size="336x280" data-slot="pr0gramm-rectangle"></div> <?js } ?> <form class="comment-form" method="post"> <textarea class="comment" name="comment"></textarea> <input type="hidden" name="parentId" value="0"/> <input type="hidden" name="itemId" value="{params.id}"/> <div> <input type="submit" value="Abschicken"/> <input type="button" value="Abbrechen" class="cancel"/><?js if(commentCount > 0) { ?> <span class="sorter"><a id="com-new" href="">Neuste</a> | <a id="com-top" href="">Top</a></span> <?js } ?> </div> </form> <form class="comment-edit-form" method="post"> <textarea class="comment" name="comment"></textarea> <input type="hidden" name="commentId" value="0"/> <div> <input type="submit" value="Abschicken"/> <input type="button" value="Abbrechen" class="cancel"/> </div> </form> <div class="comments"> <?js var recurseComments = function( comments, level ) { ?> <div class="comment-box"> <?js for( var i = 0; i < comments.length; i++ ) { var c = comments[i]; ?> <div class="comment{p.voteClass(c.vote)}" id="comment{c.id}"> <div class="comment-vote"> <span class="pict vote-up">+</span> <span class="pict vote-down">-</span> </div> <div class="comment-content"> {c.content.format()} </div> <div class="comment-foot"> <a href="#user/{c.name}" class="user um{c.mark}">{c.name}</a> <span class="score" title="{c.up} up, {c.down} down">{"Punkt".inflect(c.score)}</span> <a href="#{tab}/{itemId}:comment{c.id}" class="time permalink" title="{c.createdReadable}">{c.createdRelative}</a> <?js if( level < CONFIG.COMMENTS_MAX_LEVELS && !linearComments ) {?> <a href="#{tab}/{itemId}:comment{c.id}" class="comment-reply-link action"><span class="pict">r</span> antworten</a> <?js } ?> <?js if( /*c.user == p.user.name ||*/ p.user.admin ) {?> [ <span class="comment-delete action">del</span> / <a href="#{tab}/{itemId}:comment{c.id}" class="comment-edit-link action">edit</a> ] <?js } ?> </div> </div> <?js if( c.children.length ) { recurseComments(c.children, level+1); } ?> <?js } ?> </div> <?js }; ?> <?js recurseComments(comments, 1); ?> </div> ',

p.View.Stream.Comments.SortTime = function(a, b) {
    return (b.created - a.created);
}

p.View.Stream.Comments.prototype.loaded = function(item) {
        item.id = (item.id || this.data.itemId);
		
		if (localStorage.getItem('comorder')) {
			if (localStorage.getItem('comorder') == 'new') {
				this.data.linearComments = (item.id <= item.id);
			}else{
				this.data.linearComments = (item.id <= CONFIG.LAST_LINEAR_COMMENTS_ITEM);
			}
		} else{
			localStorage.setItem('comorder', 'top');
			this.data.linearComments = (item.id <= CONFIG.LAST_LINEAR_COMMENTS_ITEM);
		}
        
        if (item.commentId) {
            p.user.voteCache.votes.comments[item.commentId] = 1;
            this.data.params.comment = 'comment' + item.commentId;
        }
        this.data.comments = this.prepareComments(item.comments);
        this.stream.items[this.data.params.id].comments = item.comments;
        this.data.commentCount = item.comments.length;
        this.data.tab = this.parentView.parentView.tab || 'new';
        this.data.itemId = item.id;
        this.render();
}


var done = false;
var spacepressed = false;
var wheelLast = 0;
/****/// CSS und Kommentarbox links
    

		var high = $(window).height()-51;
		var highitemimage = $(window).height()-200;
		var highcontainer = $(window).height()-52;
		var widthitemimage = $(window).width()-600;
		
	$('#head-content').append('<a class="link" id="random" href=""></a>');
    
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



'form.tag-form { margin: 8px 70px 0px; width: 640px;}'+
'.sorter, .sorter a { color: rgba(155, 155, 155, 1); font-size: 0.94em;}'+
'#com-new { padding-left: 90px} #com-new, #com-top {  margin: 0px 3px;}'+
'#com-new.active, #com-new:hover { color: #EE4D2E;} #com-top.active, #com-top:hover { color: #EE4D2E;}'+
'#user-admin, #user-ban { top: 126px; }'+
'#head-content { background-color: #161618 !important; border-bottom: 2px solid #232326;}'+
'.pane, .pane-head, .tab-bar, .user-stats, .in-pane { width: 792px; margin: 0 auto !important;}'+
'#random { position: absolute; top: 18px; left: 610px; height: 16px; width: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA7ElEQVQ4je2SsUoDQRRFzyxilcJiq3QGEb/A3s7PCPZCfidGrPIDEgQ7sUinfSJEIWJnISJoJOyx8G1IIWym91Yz896587gz8K9UL9Qd4ATYbWCegIuU0tvqRC3VmZtrppYARXicAp2MyTvBrAxugGGGwTAYCrUL9IF74HwD+Cx6+2o3qVNgH/gCjoBD4BF4B7YC+gZawB5wB9wC28ADak9dRDgj9VJ9/iO4l6hfxX6h9gBQxxkvUGu8HuI8I8Ba83WDEbDMgJfB/P7EqqrKlNIx8AFMGuADoKVeF0XxCoDaVj/VQdPV6iB62wA/BoruHjilSCsAAAAASUVORK5CYII=);} '+
'#random:hover { color: #ee4d2e; cursor: pointer;)}'+
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
								'#footer-links { top: 20px; right: 250px; height: 50px;}'+
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



	setInterval(function() {

		var dingsda = document.getElementById('random');
		if (dingsda.getAttribute('href') == '') {
			insertButton();
		}
		if ($('.item-image').length) {
		
			if (!$('#com-new').hasClass('active') && !$('#com-top').hasClass('active')) {
				$('#com-' + localStorage.getItem('comorder')).toggleClass('active');
			}

			if ($('#com-new').length && !done) {
				$('#com-new').click(function() {
					localStorage.removeItem('comorder');
					$(this).toggleClass('active');
					$('#com-top').toggleClass('active');
					localStorage.setItem('comorder', 'new');
					window.location.reload(true);
					return false;
				});
				$('#com-top').click(function() {
					localStorage.removeItem('comorder');
					$(this).toggleClass('active');
					$('#com-new').toggleClass('active');
					localStorage.setItem('comorder', 'top');
					window.location.reload(true);
					return false;
				});
				done = true;
			}
			
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
			
			// zum passenden Thumb scrollen
			var itemId = document.URL;
			var itemname = '#item-' + itemId.substring(itemId.length-6, itemId.length);
			var posi = $(itemname).offset().top-52;
			window.scrollTo(0, posi);
			//if (posi != $(window).scrollTop()) {
			//	$('html,body').stop(true,true);
			//	$('html,body').animate({ scrollTop: posi }, 200);
			//}
			
		}else{
			var stil = document.getElementsByTagName('html')[0];
			stil.style.overflow='visible';	
		}
    }, 100);

		
		
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
	}
}

function isHover(e) {
if (!e) return false;
    return (e.parentElement.querySelector(':hover') === e);
}



    function getElementByXpath(path) {
      return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    //imageid für r button
     
    function getImage() {
      var lastId = 666;
      if (window.location.pathname == '/new') {
        lastId = getElementByXpath('/html/body/div[2]/div[2]/div[1]/div[1]/a[1]').id;
        lastId = lastId.split('-') [1];
        //thx@Laura
        localStorage.setItem('pr0lastId', lastId);
      }
      lastId = localStorage.getItem('pr0lastId');
      return Math.floor((Math.random() * lastId) + 1);
    }
    //r button einfügen
     
    function insertButton() {
      var div = document.getElementsByClassName('head-menu') [0];
      var imageId = getImage();
	  dingsda = document.getElementById('random');
		dingsda.setAttribute('href', 'http://pr0gramm.com/new/' + imageId);
    }

		
})();
