// ==UserScript==
// @name        pr0gramm.com Dick by Seglor
// @namespace   https://github.com/Seglormeister/Pr0gramm.com-by-Seglor
// @author		Seglormeister
// @description Improve pr0gramm mit Fullscreen wörk
// @include     http://pr0gramm.com/*
// @version     1.5.8.1
// @grant       none
// @require		  http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js
// @updateURL   https://github.com/Seglormeister/Pr0gramm.com-by-Seglor/raw/master/pr0gramm_dick.user.js
// ==/UserScript==

(function() {


// Verhindert Gewackel beim Scrollen
p.View.Stream.Main.prototype.showItem = function($item, scrollToFullView) {
        if ($item.is(this.$currentItem)) {
            this.hideItem();
            this._wasHidden = true;
			this.currentItemId = null;
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
		this.currentItemId = id;
}

p.View.Stream.Main.prototype.onscroll = function(ev) {
        if (this.loadInProgress || !this.hasItems) {
            return;
        }
		alert("scroll");
        var loadingTargetNewer = this.loadingTargetDistance / 2,
            loadingTargetOlder = $('#main-view').height() - this.loadingTargetDistance + 400;
        var current = $(document).scrollTop();
        if (current > loadingTargetOlder && !this.stream.reached.end) {
            this.loadInProgress = true;
            this.stream.loadOlder(this.loadedBound);
            this.$container.append(p.View.Base.LoadingAnimHTML);
        } else if (current < loadingTargetNewer && !this.stream.reached.start) {
            this.loadInProgress = true;
            this.stream.loadNewer(this.loadedBound);
            this.$container.prepend(p.View.Base.LoadingAnimHTML);
            $(document).scrollTop($(document).scrollTop() + (117 - 52));
        }
}


// Comments sortieren	
p.View.Stream.Comments.prototype.template = '<div class="comments-head" style="display:none"> <span class="pict">c</span> {"Kommentar".inflect(commentCount)} </div> <?js if( !p.mobile ) { ?> <div class="comments-large-rectangle gpt" id="gpt-rectangle-comments" data-size="336x280" data-slot="pr0gramm-rectangle"></div> <?js } ?> <form style="display:none" class="comment-form" method="post"> <textarea class="comment" name="comment"></textarea> <input type="hidden" name="parentId" value="0"/> <input type="hidden" name="itemId" value="{params.id}"/> <div> <input type="submit" value="Abschicken"/> <input type="button" value="Abbrechen" class="cancel"/><?js if(commentCount > 0) { ?> <span class="sorter"><a id="com-new" href="">Neuste</a> | <a id="com-top" href="">Top</a></span> <?js } ?> </div> </form> <form class="comment-edit-form" method="post"> <textarea class="comment" name="comment"></textarea> <input type="hidden" name="commentId" value="0"/> <div> <input type="submit" value="Abschicken"/> <input type="button" value="Abbrechen" class="cancel"/> </div> </form> <div style="display:none" class="comments"> <?js var recurseComments = function( comments, level ) { ?> <div class="comment-box"> <?js for( var i = 0; i < comments.length; i++ ) { var c = comments[i]; ?> <div class="comment{p.voteClass(c.vote)}" id="comment{c.id}"> <div class="comment-vote"> <span class="pict vote-up">+</span> <span class="pict vote-down">-</span> </div> <div class="comment-content"> {c.content.format()} </div> <div class="comment-foot"> <a href="#user/{c.name}" class="user um{c.mark}">{c.name}</a> <span class="score" title="{c.up} up, {c.down} down">{"Punkt".inflect(c.score)}</span> <a href="#{tab}/{itemId}:comment{c.id}" class="time permalink" title="{c.createdReadable}">{c.createdRelative}</a> <?js if( level < CONFIG.COMMENTS_MAX_LEVELS && !linearComments ) {?> <a href="#{tab}/{itemId}:comment{c.id}" class="comment-reply-link action"><span class="pict">r</span> antworten</a> <?js } ?> <?js if( /*c.user == p.user.name ||*/ p.user.admin ) {?> [ <span class="comment-delete action">del</span> / <a href="#{tab}/{itemId}:comment{c.id}" class="comment-edit-link action">edit</a> ] <?js } ?> </div> </div> <?js if( c.children.length ) { recurseComments(c.children, level+1); } ?> <?js } ?> </div> <?js }; ?> <?js recurseComments(comments, 1); ?> </div> ',

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

// Random Button hinzufügen		
$('#head-content').append('<a class="link" id="random" href=""></a>');
    
var css = '#upload-form input[type="submit"] { position:relative; top: 420px; left: 350px; }'+
'.tags { padding-left:3px; width:100%;} div.item-tags { padding: 4px 0 8px 14% !important;} div.tagsinput { position:absolute; } input[value="Tags speichern"],input[value="Abbrechen"] { float:right; }'+
'.comments-large-rectangle { overflow: hidden; height:auto; position:px; width:292px; right:0;top:0; position:relative; } .comments-large-rectangle > a > img { width: 280px; } '+
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


'#filter-menu { left: 318px !important;}'+
'div.comments { padding: 0px 0 0px 6px !important;}'+				
'.item-comments {width: 24% !important;}} '+
'#head { padding-left: 0px !important; z-index:200; } #stream-next, #stream-prev { z-index:122; top: auto !important; padding: 0 !important; bottom: 30% !important;} '+
'.item-image{max-height:460px;}'+
'.item-comments { position: fixed !important; top: 0; left: 0; width: 300px;  height: 100vh;  max-height: 100vh; overflow-y: auto; overflow-x: hidden;}'+
'.item-comments textarea.comment { resize: none;}'+
'div.comment-box > div.comment-box { padding: 0 0 0 6px; background: none repeat scroll 0px 0px rgba(0, 0, 0, 0.1) !important; border-left: 1px solid #171717;}'+		


'div.comments-head { background: rgba(42, 46, 49, 0.62);}'+
'div.comment { border: 1px solid rgba(10, 10, 11, 0.46); background: rgba(26, 27, 30, 0.7); border-radius: 2px;}'+
'.vote-fav { left: 350px !important;}'+
'.comments-large-rectangle { position:absolute; width: 0px;}'+
'.side-wide-skyscraper { left: auto !important;}'+
'form.tag-form { margin: 8px 70px 0px; width: 640px;}'+
'.sorter, .sorter a { color: rgba(155, 155, 155, 1); font-size: 0.94em;}'+
'#com-new { padding-left: 90px} #com-new, #com-top {  margin: 0px 3px;}'+
'#com-new.active, #com-new:hover { color: #EE4D2E;} #com-top.active, #com-top:hover { color: #EE4D2E;}'+
'#user-admin, #user-ban { top: 126px; }'+
'#head-content:after { left: 7px !important;}'+
'#head-content { background-color: #040405 !important; border-bottom: 2px solid #232326;}'+
'.pane, .pane-head, .tab-bar, .user-stats, .in-pane { width: 792px; margin: 0 auto !important;}'+
'#random { display: block; position: relative; top: 18px; margin-left: 650px; height: 16px; width: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA7ElEQVQ4je2SsUoDQRRFzyxilcJiq3QGEb/A3s7PCPZCfidGrPIDEgQ7sUinfSJEIWJnISJoJOyx8G1IIWym91Yz896587gz8K9UL9Qd4ATYbWCegIuU0tvqRC3VmZtrppYARXicAp2MyTvBrAxugGGGwTAYCrUL9IF74HwD+Cx6+2o3qVNgH/gCjoBD4BF4B7YC+gZawB5wB9wC28ADak9dRDgj9VJ9/iO4l6hfxX6h9gBQxxkvUGu8HuI8I8Ba83WDEbDMgJfB/P7EqqrKlNIx8AFMGuADoKVeF0XxCoDaVj/VQdPV6iB62wA/BoruHjilSCsAAAAASUVORK5CYII=);} '+
'#random:hover { color: #ee4d2e; cursor: pointer;)}'+
						'body { overflow-x:hidden; overflow-y: auto; }'+
						'#page { padding-left: 0px !important; margin: 0 0 0 0 !important; width: 100% !important; position: absolute !important;}'+
                      '#head { width: 100% !important }'+
'.item-comments { border-right: 3px solid rgb(42, 46, 49); background: none repeat scroll 0% 0% rgba(23, 23, 24, 0.89); overflow-x:hidden; top: 51px !important; width: 352px !important; height: '+high+'px !important;}' +
                                '.item-container-content { padding-left: 200px !important; display: table-cell; vertical-align: middle;}'+
                                'div.item-container { z-index: 2; background: rgba(0, 0, 0, 0.9) !important; position: fixed !important; display: table; height: '+highcontainer+'px !important; width: 100% !important; }'+
                                'div.stream-row { clear: none !important; }'+
                                '#main-view { max-width: 101% !important; width: 101% !important; }'+
                                '.user-info { margin: 20px 30px 0 0 !important; }'+
                                '#pr0gramm-logo { margin-left: 15px !important; }'+
                                '.item-pointer { display: none !important; }'+
								'#stream-prev {right: auto !important;}'+
								'#stream-next { right: 0 !important; left: auto !important;}'+
								'span.flags {padding-left: 120px; float: none !important;}'+
								'.item-fullsize-link { right: 10px !important;}'+
								'.item-container-content img { max-height: '+highitemimage+'px !important;}'+
								'.item-image { max-height: '+highitemimage+'px !important; max-width: '+widthitemimage+'px !important;}'+
								'video.item-image { width: auto;}'+
				'.video-position-bar { max-width: '+widthitemimage+'px !important;}'+
                'div.item-tags { height: 37px; padding: 4px 0 8px 240px !important;}'+
								'.head-menu { left: 200px; position: absolute;}'+
								'div.in-pane { margin-left: -5px}'+
								'#footer-links { top: 20px; left: auto !important; right: 270px !important; height: 20px; width:100px !important; bottom: 0px !important; margin: 0 !important}'+
								'.item-image-wrapper { max-width: '+widthitemimage+'px; margin: 0px auto;}'+
                'div.item-vote { left: 180px;}'+
				'::-webkit-scrollbar { width: 10px;} ::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.3); -webkit-border-radius: 7px; border-radius: 7px;}'+ 
        '::-webkit-scrollbar-thumb { border-radius: 7px; -webkit-border-radius: 7px; background: #949494; -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.5); }'+
  
'.ssb_down {display:none;background:#000;bottom:0;cursor:pointer;position:absolute;right:0;}'+
'.ssb_sb {border-radius: 7px; -webkit-border-radius: 7px; background: rgb(102, 102, 102); -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.5);cursor:pointer;position:absolute;right:0;}'+
'.ssb_sb_down {}'+
'.ssb_sb_over {background: #777;}'+
'.ssb_st {background: #2A2E31; height:100%; -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.3);cursor:pointer;position:absolute;right:0;top:0;}'+
'.ssb_up {display:none;cursor:pointer;position:absolute;right:0;top:0;}';
	
// CSS Style hinzufügen
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
	
  
// INDEXEDDB
	
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;	
	
if (!window.indexedDB) {
    window.alert("Ihr Browser unterstützt keine stabile Version von IndexedDB. Dieses und jenes Feature wird Ihnen nicht zur Verfügung stehen.");
}

function saveid() {
	var ids = 0;
	if ($('.item-image').length && window.location.pathname.match('/([0-9]{2,7})')) {
		var db;
		var open = indexedDB.open("UploadsSeen", 1);
		open.onsuccess = function (evt) {
			db = this.result;
			//db = evt.target.result;
			console.log("openDb DONE");
				var uploadid = newurl.match('/([0-9]{2,7})');
				var trans = db.transaction("uploads", "readwrite");
				trans.onsuccess = function(evt) {
					 console.log("trans saved: ", uploadid[1]);
				};
				trans.onerror = function(evt) {
					console.log("trans Error:", evt.target.error.name);
				};
				var store = trans.objectStore("uploads");
				var requestAdd = store.add({id: uploadid[1], uploadid: uploadid[1]});	
				requestAdd.onsuccess = function(evt) {
					 console.log("ID saved: ", uploadid[1]);
				};
				requestAdd.onerror = function(evt) {
					console.log("Save Error:", evt.target.error.name);
				};
		};
		open.onerror = function (evt) {
		  console.log("openDb Error:", evt.target.errorCode);
		};
		open.onupgradeneeded = function (evt) {
		  console.log("openDb.onupgradeneeded");
		  var store = evt.target.result.createObjectStore( "uploads", { keyPath: "id"});
		  store.createIndex("uploadid", "uploadid", { unique: true });
		};
	}else if ($('#stream').length){
		var db;
		var open = indexedDB.open("UploadsSeen", 1);
		open.onsuccess = function (evt) {
			db = this.result;
			console.log("openDb2 DONE");
			var trans = db.transaction("uploads", "readonly");
			var store = trans.objectStore("uploads");
			var first = $('.stream-row a:first').attr('id');
			var last = $('#stream .stream-row:last').find('a:last').attr('id');
			var range = IDBKeyRange.bound(last.slice(5), first.slice(5));
			store.openCursor(range, 'prevunique').onsuccess = function(event) {
				var cursor = event.target.result;

				if (cursor) {
					var value = parseInt(cursor.value.uploadid);
					if ($('#item-' + value).children('div').length == 0) {
						$('#item-' + value).append('<div class="seen" style="border-bottom: 1px solid  rgba(255, 72, 0, 0.84); height: 17px; background: none repeat scroll 0% 0% rgba(22, 22, 24, 0.7); position: relative; width: 128px; top: -17px;"><img style="opacity: 0.7; margin:auto; width:13px; padding-top: 1px;" src="http://i.imgur.com/CC4GAUc.png"></div>');
					}
					ids++;
					cursor.continue();
				}else{
					console.log("No more entries!", ids);
				}
			};
			store.openCursor(range, 'prevunique').onerror = function(event) {
				console.log("Db2 Error: ", event);
			};
		};
		open.onerror = function (evt) {
		  console.log("openDb Error:", evt.target.errorCode);
		};
		open.onupgradeneeded = function (evt) {
		  console.log("openDb.onupgradeneeded");
		  var store = evt.target.result.createObjectStore( "uploads", { keyPath: "id"});
		  db = evt.target.result;
		};	
	}
}

window.onload = function() { setTimeout(function() { saveid();}, 600);};

var oldurl = '';
var newurl = '';
setInterval(function() {
	newurl = window.location.pathname;
	if (oldurl != newurl) {
		oldurl = newurl;
		saveid();
	}
}, 100);



	setInterval(function() {

		var dingsda = document.getElementById('random');
		if (dingsda.getAttribute('href') == '') {
			insertButton();
		}
      
		// Bei Laden von neuem Content, saveid aufrufen
        var loadingTargetNewer = 2048 / 2,
            loadingTargetOlder = $('#main-view').height() - 2048 + 400;
        var current = $(document).scrollTop();
        if (current > loadingTargetOlder) {
			saveid();
        }	  
	  
		if ($('.item-image').length) {

		   // Scrollbar laden in den Comments
		   if ($('.item-comments').length && !$('.item-comments').hasClass('scroll')) {
			  if ($('.comments').height() > ($('.item-comments').height()-230)) {
				 ssb.scrollbar('item-comments');
				 $('.item-comments').addClass('scroll');
				 $('.item-comments').attr('style', 'border-right: 0 !important; background: rgba(23, 23, 24, 0.45) !important');
				 $('.item-comments:first').css('overflow', 'hidden');
			  }
		   }
			
		   $('.comments-head').fadeIn(300);
		   $('.comment-form').fadeIn(300);
		   $('.comments').fadeIn(300);
		
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
			
		}else{
			
			var stil = document.getElementsByTagName('html')[0];
			if (stil.style.overflowX != 'hidden' || stil.style.overflowY != 'auto') {
				stil.style.overflowX = 'hidden';	
				stil.style.overflowY = 'auto';	
			}
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
		if (isHover(coms[0])) {
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


// Code für den Random Button
    function getElementByXpath(path) {
      return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
     
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
      var div = document.getElementsByClassName('head-menu')[0];
      var imageId = getImage();
	  dingsda = document.getElementById('random');
		dingsda.setAttribute('href', 'http://pr0gramm.com/new/' + imageId);
    }

    
// Custom Scrollbar
var ssb = {
    aConts  : [],
    mouseY : 0,
    N  : 0,
    asd : 0,
    sc : 0,
    sp : 0,
    to : 0,

    // constructor
    scrollbar : function (cont_id) {
        if (cont_id == 'item-comments') { var cont = document.getElementsByClassName(cont_id)[0]; }
        else if (cont_id == 'page') { var cont = document.getElementById(cont_id);}

        // perform initialization
        if (! ssb.init()) return false;

        var cont_clone = cont.cloneNode(false);
        cont_clone.style.overflow = "hidden";
        cont.parentNode.appendChild(cont_clone);
        cont_clone.appendChild(cont);
        //cont.style.position = 'relative !important';
        //cont.style.left = cont.style.top = '0px';
        //cont.style.width = cont.style.height = '891px';
        
        // adding new container into array
        ssb.aConts[ssb.N++] = cont;

        cont.sg = false;

        //creating scrollbar child elements
        cont.st = this.create_div('ssb_st', cont, cont_clone);
        cont.sb = this.create_div('ssb_sb', cont, cont_clone);
        cont.su = this.create_div('ssb_up', cont, cont_clone);
        cont.sd = this.create_div('ssb_down', cont, cont_clone);

        // on mouse down processing
        cont.sb.onmousedown = function (e) {
            if (! this.cont.sg) {
                if (! e) e = window.event;

                ssb.asd = this.cont;
                this.cont.yZ = e.screenY;
                this.cont.sZ = cont.scrollTop;
                this.cont.sg = true;

                // new class name
                this.className = 'ssb_sb ssb_sb_down';
            }
            return false;
        }
        // on mouse down on free track area - move our scroll element too
        cont.st.onmousedown = function (e) {
            if (! e) e = window.event;
            ssb.asd = this.cont;

            ssb.mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            for (var o = this.cont, y = 0; o != null; o = o.offsetParent) y += o.offsetTop;
            this.cont.scrollTop = (ssb.mouseY - y - (this.cont.ratio * this.cont.offsetHeight / 2) - this.cont.sw) / this.cont.ratio;
            this.cont.sb.onmousedown(e);
        }

        // onmousedown events
        cont.su.onmousedown = cont.su.ondblclick = function (e) { ssb.mousedown(this, -1); return false; }
        cont.sd.onmousedown = cont.sd.ondblclick = function (e) { ssb.mousedown(this,  1); return false; }

        //onmouseout events
        cont.su.onmouseout = cont.su.onmouseup = ssb.clear;
        cont.sd.onmouseout = cont.sd.onmouseup = ssb.clear;

        // on mouse over - apply custom class name: ssb_sb_over
        cont.sb.onmouseover = function (e) {
            if (! this.cont.sg) this.className = 'ssb_sb ssb_sb_over';
            return false;
        }

        // on mouse out - revert back our usual class name 'ssb_sb'
        cont.sb.onmouseout  = function (e) {
            if (! this.cont.sg) this.className = 'ssb_sb';
            return false;
        }

        // onscroll - change positions of scroll element
        cont.ssb_onscroll = function () {
            //var coms = document.getElementsByClassName("comments")[0];
            
            //if (isHover(coms[0])) {
			if (cont_id == 'item-comments') {
               this.ratio = this.offsetHeight / $('.comments').outerHeight(true);
			}else{
				console.log($('#main-view').height());
				this.ratio = ($(window).height()-52) / $('#main-view').height();
				//this.st.style.height =  $('#main-view').height() + 'px';
				//this.sb.style.height = Math.ceil(this.ratio * 666) + 'px';
			}
               this.sb.style.top = Math.floor(this.scrollTop * this.ratio) + 'px';
           //}
        }

        // scrollbar width
        cont.sw = 11;

        // start scrolling
        cont.ssb_onscroll();
        ssb.refresh();
        
        // binding own onscroll event
        cont.onscroll = cont.ssb_onscroll;
		var conte = document.getElementById('page');
		conte.onscroll = function() {alert("test");};
		
		//var elem = document.getElementById('#page');
		//elem.onscroll = cont.ssb_onscroll;
        return cont;
    },

    // initialization
    init : function () {
        if (window.oper || (! window.addEventListener && ! window.attachEvent)) { return false; }

        // temp inner function for event registration
        function addEvent (o, e, f) {
            if (window.addEventListener) { o.addEventListener(e, f, false); ssb.w3c = true; return true; }
            if (window.attachEvent) return o.attachEvent('on' + e, f);
            return false;
        }

        // binding events
        addEvent(window.document, 'mousemove', ssb.onmousemove);
        addEvent(window.document, 'mouseup', ssb.onmouseup);
        addEvent(window, 'resize', ssb.refresh);
        return true;
    },

    // create and append div finc
    create_div : function(c, cont, cont_clone) {
        var o = document.createElement('div');
        o.cont = cont;
        o.className = c;
        cont_clone.appendChild(o);
        return o;
    },
    // do clear of controls
    clear : function () {
        clearTimeout(ssb.to);
        ssb.sc = 0;
        return false;
    },
    // refresh scrollbar
    refresh : function () {
        for (var i = 0, N = ssb.N; i < N; i++) {
            var o = ssb.aConts[i];
            o.ssb_onscroll();
            o.sb.style.width = o.su.style.width = o.su.style.height = o.sd.style.width = o.sd.style.height = o.sw + 'px';
			o.st.style.width = (o.sw + 6) + 'px';
			o.st.style.height =  $(window).height() + 'px'; //'#main-view'
            //o.sb.style.height = Math.ceil(Math.max(o.sw * .5, o.ratio * o.offsetHeight) + 1) + 'px';
            o.sb.style.height = Math.ceil(o.ratio * 666) + 'px';
			o.sb.style.right = '3px';
        }
    },
    // arrow scrolling
    arrow_scroll : function () {
        if (ssb.sc != 0) {
            ssb.asd.scrollTop += 6 * ssb.sc / ssb.asd.ratio;
            ssb.to = setTimeout(ssb.arrow_scroll, ssb.sp);
            ssb.sp = 32;
        }
    },


    // scroll on mouse down
    mousedown : function (o, s) {
        if (ssb.sc == 0) {
            // new class name
            o.cont.sb.className = 'ssb_sb ssb_sb_down';
            ssb.asd = o.cont;
            ssb.sc = s;
            ssb.sp = 400;
            ssb.arrow_scroll();
        }
    },
    // on mouseMove binded event
    onmousemove : function(e) {
        if (! e) e = window.event;
        // get vertical mouse position
        ssb.mouseY = e.screenY;
        if (ssb.asd.sg) ssb.asd.scrollTop = ssb.asd.sZ + (ssb.mouseY - ssb.asd.yZ) / ssb.asd.ratio;
    },
    // on mouseUp binded event
    onmouseup : function (e) {
        if (! e) e = window.event;
        var tg = (e.target) ? e.target : e.srcElement;
        if (ssb.asd && document.releaseCapture) ssb.asd.releaseCapture();

        // new class name
        if (ssb.asd) ssb.asd.sb.className = (tg.className.indexOf('scrollbar') > 0) ? 'ssb_sb ssb_sb_over' : 'ssb_sb';
        document.onselectstart = '';
        ssb.clear();
        ssb.asd.sg = false;
    }
}

// Seite zentrieren links/rechts
	var mainwidth = $('#main-view' ).width();
	var margin = (mainwidth-(Math.floor(mainwidth/132)*132))/2-15 + 'px';
	$('div#stream').css('margin-left', margin);
		
})();
