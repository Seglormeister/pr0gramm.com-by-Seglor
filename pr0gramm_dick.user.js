// ==UserScript==
// @name		pr0gramm.com Dick by Seglor
// @namespace	https://github.com/Seglormeister/Pr0gramm.com-by-Seglor
// @author		Seglormeister
// @description	Verbessert das pr0gramm mit einigen Erweiterungen
// @include		http://pr0gramm.com/*
// @icon		http://pr0gramm.com/media/pr0gramm-favicon.png
// @version		1.6.0.0
// @grant		none
// @require		http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js
// @updateURL	https://github.com/Seglormeister/Pr0gramm.com-by-Seglor/raw/master/pr0gramm_dick.user.js
// ==/UserScript==

(function() {
//¯\_(ツ)_/¯ 

function waitForPage(){
    if(typeof p !== "undefined"){
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

p.View.Stream.Main.prototype.loaded = function(items, position, error) {
        this.itemsPerRow = p.mainView.thumbsPerRow;
        this.$container.find('.spinner').remove();
        if (!items || !items.length) {
            var msg = null;
            var fm = null;
            if (error && (fm = error.match(/^(nsfw|nsfl|sfw)Required$/))) {
                msg = 'Das Bild wurde als <em>' + fm[1].toUpperCase() + '</em> markiert.<br/>' +
                    (p.user.id ? 'Ã„ndere deine Filter-Einstellung' : 'Melde dich an') + ' wenn du es sehen willst.'
            } else if (!this.hasItems) {
                msg = 'Nichts gefunden &#175;\\_(&#12484;)_/&#175;';
            }
            if (msg) {
                this.$container.html('<h2 class="main-message">' + msg + '</h2>');
            }
            return;
        }
        if (position == p.Stream.POSITION.PREPEND) {
            var prevHeight = $('#main-view').height();
            var firstRow = this.$streamContainer.find('.stream-row:first');
            var placeholders = firstRow.find('.thumb-placeholder');
            var numPlaceholders = placeholders.length
            if (numPlaceholders) {
                var html = '';
                for (var i = 0; i < numPlaceholders; i++) {
                    html += this.buildItem(items[items.length - numPlaceholders - 1 + i]);
                }
                placeholders.remove();
                firstRow.prepend(this.prepareThumbsForInsertion(html));
            }
            var html = this.buildItemRows(items, 0, items.length - numPlaceholders, position);
            this.$streamContainer.prepend(this.prepareThumbsForInsertion(html));
            var newHeight = $('#main-view').height() - (117 - 52);
            $(document).scrollTop($(document).scrollTop() + (newHeight - prevHeight));
        } else if (position == p.Stream.POSITION.APPEND) {
            var lastRow = this.$streamContainer.find('.stream-row:last');
            var itemCount = lastRow.find('.thumb').length;
            var fill = 0;
            if (itemCount % this.itemsPerRow != 0) {
                var html = '';
                fill = this.itemsPerRow - itemCount;
                for (var i = 0; i < fill; i++) {
                    html += this.buildItem(items[i]);
                }
                lastRow.append(this.prepareThumbsForInsertion(html));
            }
            var html = this.buildItemRows(items, fill, items.length, position);
            this.$streamContainer.append(this.prepareThumbsForInsertion(html));
        }
        if (this.jumpToItem) {
            var target = $('#item-' + this.jumpToItem);
            if (target.length) {
                $(document).scrollTop(target.offset().top - CONFIG.HEADER_HEIGHT);
                this.showItem(target);
            }
            this.jumpToItem = null;
        }
        this.loadInProgress = false;
        this.hasItems = true;
}


p.View.Stream.Item.prototype.template = '<div class="item-pointer"> </div> <?js if(localStorage.getItem("commentview") == "wide") { ?> <div class="item-container-content wide"> <?js }else{ ?> <div class="item-container-content"> <?js } ?> <div class="item-image-wrapper"> <?js if( item.video ) { ?> <?js if( canPlayWebM ) { ?> <video class="item-image" src="{item.image}" type="video/webm" autoplay loop></video> <div class="video-position-bar"> <div class="video-position-bar-background"> <div class="video-position"></div> </div> </div> <?js } else { ?> <canvas class="item-image"></canvas> <?js } ?> <?js } else { ?> <img class="item-image" src="{item.image}"/> <?js if(item.fullsize) { ?> <a href="{item.fullsize}" target="_blank" class="item-fullsize-link">+</a> <?js } ?> <?js } ?> <div class="stream-prev pict">&lt;</div> <div class="stream-next pict">&gt;</div> </div> <div class="item-info"> <div class="item-vote{p.voteClass(item.vote)}"> <span class="pict vote-up">+</span> <span class="pict vote-down">-</span> <span class="score" title="{item.up} up, {item.down} down"><?js print(item.up - item.down)?></span> </div> <?js if( item.user != p.user.name ) {?> <?js if(localStorage.getItem("commentview") == "wide") { ?> <span class="pict wide vote-fav{p.favClass(item.vote)}">*</span> <?js }else{ ?> <span class="pict vote-fav{p.favClass(item.vote)}">*</span> <?js } ?> <?js } ?> <div class="item-details"> <a class="time" title="{item.time.readableTime()}" href="/new/{item.id}">{item.time.relativeTime(true)}</a> <span class="time">von</span> <a href="#user/{item.user}" class="user um{item.mark}">{item.user}</a> <span class="item-source"> <?js if( item.source ) {?> <span class="pict">s</span>&nbsp;<a href="{{item.source}}" target="_blank">{{item.source.hostName()}}</a> <?js } else { ?> <span class="pict">s</span>upload</span> <?js } ?> </span> <?js if( !item.video ) {?> <span class="item-google-search"> <span class="pict">g</span>&nbsp;<a href="https://www.google.com/searchbyimage?hl=en&amp;safe=off&amp;site=search&amp;image_url={item.image}" target="_blank"> Bild googeln </a> </span> <?js } ?> <?js if( p.user.admin ) { ?> [<span class="action" id="item-delete" data-id="{item.id}">del</span>] [<a href="/new/phash.{item.id}.12">phash</a>] <?js } ?> <span class="flags flags-{item.flags}">{p.Stream.FLAG_NAME[item.flags]}</span></div> <div class="item-tags"></div> </div> <div class="divider-full-banner gpt" id="gpt-divider-banner" data-size="468x60" data-slot="pr0gramm-banner"></div> <div class="divider-large-rectangle gpt" id="gpt-divider-rectangle" data-size="336x280" data-slot="pr0gramm-rectangle"></div> <?js if(localStorage.getItem("commentview") == "wide") { ?> <div class="item-comments wide"></div> <?js }else{ ?> <div class="item-comments"></div> <?js } ?> </div> ';
    
p.opClass = function(currentOp, currentUser) {
	if(!currentOp || !currentUser)
	return "";
	return currentOp == currentUser ? " opuser" : "";
};

// Comments Template	
p.View.Stream.Comments.prototype.template = '<div class="comments-head" style="display:none"> <span class="pict">c</span> {"Kommentar".inflect(commentCount)} <span class="commentview" title="Erweiterte Kommentaransicht"></span></div> <div class="comments-large-rectangle gpt" id="gpt-rectangle-comments" data-size="336x280" data-slot="pr0gramm-rectangle"></div> <form style="display:none" class="comment-form" method="post"> <textarea class="comment" name="comment" required placeholder="Kommentar schreiben..."></textarea> <input type="hidden" name="parentId" value="0"/> <input type="hidden" name="itemId" value="{params.id}"/> <div> <input type="submit" value="Abschicken"/> <input type="button" value="Abbrechen" class="cancel"/><?js if(commentCount > 0) { ?> <span class="sorter"><a id="com-new" href="">[ Neuste</a> | <a id="com-top" href="">Top ]</a></span> <?js } ?> </div> </form> <form class="comment-edit-form" method="post"> <textarea class="comment" required name="comment"></textarea> <input type="hidden" name="commentId" value="0"/> <div> <input type="submit" value="Abschicken"/> <input type="button" value="Abbrechen" class="cancel"/> </div> </form> <div style="display:none" class="comments"> <?js var recurseComments = function( comments, level, farbe ) { ?> <div class="comment-box"> <?js for( var i = 0; i < comments.length; i++ ) { var c = comments[i]; ?> <div class="comment{p.voteClass(c.vote)}{p.opClass(itemOp,c.name)} commentfarbe{farbe}" id="comment{c.id}"> <div class="comment-vote"> <span class="pict vote-up">+</span> <span class="pict vote-down">-</span> </div> <div class="comment-content"> {c.content.format()} </div> <div class="comment-foot"> <a href="#user/{c.name}" class="user um{c.mark}">{c.name}</a> <span class="score" title="{c.up} up, {c.down} down">{"Punkt".inflect(c.score)}</span> <a href="#{tab}/{itemId}:comment{c.id}" class="time permalink" title="{c.createdReadable}">{c.createdRelative}</a> <?js if( level < CONFIG.COMMENTS_MAX_LEVELS && !linearComments ) {?> <a href="#{tab}/{itemId}:comment{c.id}" class="comment-reply-link action"><span class="pict">r</span> antworten</a> <?js } ?> <?js if( /*c.user == p.user.name ||*/ p.user.admin ) {?> [ <span class="comment-delete action">del</span> / <a href="#{tab}/{itemId}:comment{c.id}" class="comment-edit-link action">edit</a> ] <?js } ?> </div> </div> <?js if( c.children.length ) { if(farbe==5) farbe = 0; recurseComments(c.children, level+1, farbe+1); } ?> <?js } ?> </div> <?js }; ?> <?js recurseComments(comments, 1, 1); ?> </div> ';
 
p.View.Stream.Comments.SortTime = function(a, b) {
    return (b.created - a.created);
}

p.View.Stream.Comments.prototype.loaded = function(item) {
        item.id = (item.id || this.data.itemId);
		if (localStorage.getItem('comorder')) {
			if (localStorage.getItem('comorder') == 'new') {
				this.data.linearComments = (item.id <= item.id);
			}else if (localStorage.getItem('comorder') == 'top') {
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
		this.data.itemOp = item.user || null;
        this.render();
}

// Remove span class sorter in comments
p.View.Stream.Comments.prototype.showReplyForm = function(ev) {
        if (!p.mainView.requireLogin()) {
            return false;
        }
        var $foot = $(ev.currentTarget.parentNode);
        if ($foot.has('.comment-form').length) {
            return;
        }
        var parentId = ev.currentTarget.href.split(':comment')[1];
        var $form = this.$commentForm.clone(true);
        $form.find('input.cancel').show();
        $form.find('input[name=parentId]').val(parentId);
		$form.find('span.sorter').remove();
        $foot.append($form);
        $form.find('textarea').val('').addClass('reply').focus();
        return false;
}

    }else{
		console.log('p undefined');
        setInterval(function(){
            waitForPage();
        },250);
    }
}
waitForPage();

var spacepressed = false;
var wheelLast = 0;
var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
/*
		var high = $(window).height()-51;
		var highitemimage = $(window).height()-200;
		var highcontainer = $(window).height()-52;
		var widthitemimage = $(window).width()-600;
*/
// Random Button und Bereits gesehen Button einfügen
var valueseen = localStorage.getItem('alreadyseen')=='on'? 'active': '';
$('#head-menu').append('<a class="link '+valueseen+'" title="bereits gesehen-Feature aktivieren\/deaktivieren" id="brille" href=""></a><a class="link" id="random" title="Random Upload aufrufen" href=""></a>');

/****/// CSS
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
'.item-comments {width: 23% !important;}} '+
'div.item-details {padding: 8px 0px 8px 50px;}'+

'#head { padding-left: 0px !important; z-index:200; }'+
'.stream-next, .stream-prev { padding: 200px 0 0 !important; margin: 200px 0px 0px !important; position: fixed !important; color: rgba(245, 247, 246, 0.29) !important; font-size: 38px !important; }'+
'.stream-next:hover, .stream-prev:hover { color: rgba(238, 77, 46, 1.0) !important; }'+
'.stream-prev { left: 24% !important;}'+
'.item-comments { -webkit-transform: translateZ(0); position: fixed !important; top: 0; left: 0; width: 300px;  height: 100vh;  max-height: 100vh; overflow-y: auto; overflow-x: hidden;}'+
'.item-comments textarea.comment { resize: none; box-shadow: 0 0 0 2px rgba(72, 72, 72, 0.36);}'+
'div.comment-box > div.comment-box { padding: 0 0 0 14px; background: none repeat scroll 0px 0px rgba(0, 0, 0, 0.1) !important; border-left: 1px solid #292929;}'+		


'@-webkit-keyframes fadeInLeft { 0% { opacity: 1; -webkit-transform: translateX(-400px);} 100% { opacity: 1; -webkit-transform: translateX(0); } }'+
'@keyframes fadeInLeft { 0% { opacity: 1; transform: translateX(-400px);} 100% { opacity: 1; transform: translateX(0); } }'+
'.fadeInLeft { -webkit-animation-name: fadeInLeft; animation-name: fadeInLeft;}'+
'.commentview { background: url("http://i.imgur.com/frLdEe2.png"); float: right; cursor: pointer; background-size: 18px 18px; height: 18px; width: 18px;}'+
'.commentview:hover { background: url("http://i.imgur.com/Am2MFVM.png"); background-size: 18px 18px; height: 18px; width: 18px;}'+
'div.item-comments.wide { width: 40% !important;}'+//($(window).width() * 0.4)
'div.item-comments .second .wide { width: 100% !important;}'+
'div.item-container-content.wide { padding-left: 40% !important;}'+
'div.item-container-content.wide .item-image-wrapper { max-width: 90% !important;}'+
'div.item-container-content.wide .item-image { max-width: 100% !important;}'+
'div.item-container-content.wide .stream-prev { left: 40% !important;}'+

'span.vote-fav.wide { left: 130px !important; top: 0px !important;}'+
'.commentfarbe1 { border-left: 2px solid rgb(51, 52, 150) !important;}'+
'.commentfarbe2 { border-left: 2px solid rgba(48, 221, 22, 0.72) !important;}'+
'.commentfarbe3 { border-left: 2px solid rgba(254, 137, 6, 0.85) !important;}'+
'.commentfarbe4 { border-left: 2px solid rgba(245, 0, 0, 0.77) !important;}'+
'.commentfarbe5 { border-left: 2px solid rgba(167, 22, 221, 0.72) !important;}'+
'.opuser .user:before { content: \'OP\'; color: #FFF; padding: 1px 3px; vertical-align: baseline; font-weight: bold; border-radius: 0.25em; background-color: rgb(238, 77, 46); margin-right: 5px; }'+

'div.comments-head { background: rgba(42, 46, 49, 0.62);}'+
'div.comment { border: 1px solid rgba(10, 10, 11, 0.46); background: rgba(26, 27, 30, 0.7); border-radius: 2px;}'+
'.vote-fav { left: 230px !important; top: 20px !important;}'+
'.comments-large-rectangle { position:absolute; width: 0px;}'+
'.side-wide-skyscraper { display:none;}'+
'form.tag-form { margin: 8px 70px 0px; width: 640px;}'+
'.sorter, .sorter a { color: rgba(155, 155, 155, 1); font-size: 0.94em;}'+
'#com-new { padding-left: 90px} #com-new, #com-top {  margin: 0px 3px;}'+
'#com-new.active, #com-new:hover { color: #EE4D2E;} #com-top.active, #com-top:hover { color: #EE4D2E;}'+
'#user-admin, #user-ban { top: 126px; }'+
'#head-content:after { left: 15px !important;}'+
'#head-content { opacity: 0.97; background-color: #040405 !important; border-bottom: 2px solid #232326;}'+
'.pane, .pane-head, .tab-bar, .user-stats, .in-pane { width: 792px; margin: 0 auto !important;}'+
'#random { float: right; margin-top: 2px; margin-left: 10px; height: 16px; width: 16px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAARCQAAEQkAGJrNK4AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEfSURBVHjazNK/K8VRHMbx1/dehIVbSpcJJWVguFKMRmUxGCibP8Ji8g8Y7mIxmxgYLEpXGUgokx+DhQhd9+tH0rUc+k7X9WPwWU6ncz7v8zyf80TlctlvK+UP6v9Aah4e4+R+BgNIV+h5wz7yn5DE4SzmvyGgFXMQFeMSjGH1B04msPwxk2bE3wQ8o+ljsBFekMNKlYA19KOIdFSMSwUMYxuT2ME1znATXqxHBh3IYgiLGMFuDQYDfRjj6EEvWoLN2vAjdwF+jKkAgFxUjEt9WEcbnnCB7gpWToOaRlxhNIUDbIQLDV8AoCsAYBN7qUSAflJvybDl0R5UdFbRfI4TLCQhR9hCAUtfKIswHdbDZGIzuMUr6qpQch+ClsXl+wCQR0NjActcNgAAAABJRU5ErkJggg==);} '+

'#random:hover { background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAARCQAAEQkAGJrNK4AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEaSURBVHjazNO/K8RxHMfxx/fuCAtXSseEklLHcKJuNOosykLZbP4BA5N/wHCLxZ9gYbAoPzYSyuTHYCE6UkK6zvK5+k7uDoPX8unz4/38vF593p+oUqn4rRL+QP8HEpUK2fh8AaNIflNTxgmK1YVUbHMJqw0Y6MJKPM5UgwBYxkwc0oHXBiHvaK9CInwgh806AVsYwQuSKewjj0PMYhwPuMZjuLEFafQig0WsYwJHKYwFeh7TGMQQOkPMpvAiTwF+gbkAgFxUKmSHsY1uvOEWA99EuQpu2nCPyQROsRMOtNYAQH8AwC6OE7EG+onK8WYroie46Kuj+AaXWItDzrGHA2zUcBZhPoxn8b+TRgmfaK7DyXNotAzuvgYAbyA4nkq8OzEAAAAASUVORK5CYII=); cursor: pointer;}'+
'#brille { float: right; margin-left: 10px; margin-top: 2px; height: 17px; width: 17px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAABJ0AAASdAHeZh94AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEJSURBVHjanNStSwRBGMfxzy4LokGLYNBgsYhNQTAaNIhBMFhNxgtaNZiEKxZFDCarcMEqJjH48gf4D4ggF4TdDXJoGY9jce8cn/K8zpeZ4TeT5GUB4zjAtL/bG5p4yQLgEqvibRFbSV4WF9jGCU4jAOs4QivJy+IGyxjDR+ROvnCXIg+FyUjAaPBl2lNMIiHd+TRi0T5KjFQbdZA9LPXkDRziHp/V4awG0gx+Ams4xhU2fxuugyzgMQgKrusA/Y7zhPkQPwRN1FrWp/cc+p1BN55WhFO1zgChdSHDIX6N1MmPuocytEOyg7MIyErwRZKXxQxamP3HK25jIwn/yRx2MRUBeMc5br8HAIJvOCo2x8ekAAAAAElFTkSuQmCC);}'+
'#brille.active { cursor: pointer; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAABJ0AAASdAHeZh94AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEHSURBVHjanNO/K8VhFMfx1719SwwmMlAsFsNdKOUPYNAdlOI/MN6BSTEoJXexkMxWZfAXWAx+jAb+ACl9B8UdpGs59O12v5fHWc6Pz3nePefpPJW8XoMhbGPC3+0ZTTxkATjFgnSbxWqG/QAc4igBUMcedjOMR3ETrwmQ+4AMV/EWxdHEUQbDt6qFYiUR8tNfTTi0hRYGOoUyyAbmCnkDO7jCR2dzVgJphh/BIg5whuVuzWWQGdzEQsFFGaDXOLeYjvg6dqLUsh7aXeifv7148SbtLnovQLsI6Y/4KXFPvre7L0MeyRqOEyDz4d8reb02iXNM/eMX51jK8IgVrGMsAfCCE1x+DQDslCyF2ZAs+QAAAABJRU5ErkJggg==);)}'+
'#brille:hover { background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAABJ0AAASdAHeZh94AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEHSURBVHjanNO/K8VhFMfx1719SwwmMlAsFsNdKOUPYNAdlOI/MN6BSTEoJXexkMxWZfAXWAx+jAb+ACl9B8UdpGs59O12v5fHWc6Pz3nePefpPJW8XoMhbGPC3+0ZTTxkATjFgnSbxWqG/QAc4igBUMcedjOMR3ETrwmQ+4AMV/EWxdHEUQbDt6qFYiUR8tNfTTi0hRYGOoUyyAbmCnkDO7jCR2dzVgJphh/BIg5whuVuzWWQGdzEQsFFGaDXOLeYjvg6dqLUsh7aXeifv7148SbtLnovQLsI6Y/4KXFPvre7L0MeyRqOEyDz4d8reb02iXNM/eMX51jK8IgVrGMsAfCCE1x+DQDslCyF2ZAs+QAAAABJRU5ErkJggg==);)}'+


'body { overflow-x:hidden; overflow-y: auto; }'+
'#page { padding-left: 0px !important; margin: 0 0 0 0 !important; width: 100% !important; position: absolute !important;}'+
'body.two-sidebars div#head, body.two-sidebars div#page { padding: 0 !important;}'+
'#head { width: 100% !important }'+
'div.comment-vote { left: 5px !important;}'+
'.item-comments { height: calc(100vh - 51px) !important; border-right: 3px solid rgb(42, 46, 49); background: none repeat scroll 0% 0% rgba(23, 23, 24, 0.89); overflow-x:hidden; top: 51px !important; width: 352px !important;}' +//'+high+'
'.item-container-content { overflow: visible !important; padding-left: 23%; display: table-cell; vertical-align: middle;}'+
'div.item-container { padding-bottom: 0px !important; z-index: 2; background: rgba(0, 0, 0, 0.9) !important; position: fixed !important; display: table; height: calc(100% - 52px) !important; width: 100% !important; }'+//'+highcontainer+'px
'div.stream-row { clear: none !important; }'+
'#main-view { max-width: 101% !important; width: 101% !important; }'+
'.user-info { margin: 20px 30px 0 0 !important; }'+
'#pr0gramm-logo { margin-left: 15px !important; }'+
'.item-pointer { display: none !important; }'+
'span.flags {margin-left: 120px; float: none !important; color: #FFF !important; text-shadow: 0px 2px 3px rgb(5, 5, 5);}'+
'a.item-fullsize-link { right: 10px !important; position: absolute; color: #fff; opacity: 0.7; padding: 0 24px; font-size: 48px; right: 0; top: 0; text-shadow: 0 0 3px #000; z-index: 10;}'+
'a.item-fullsize-link:hover { color: #ee4d2e; opacity: 1; text-shadow: none;}'+
//'.item-container-content img { max-height: calc(100% - 200px);}'+//'+highitemimage+'px
'.item-image { max-height: calc(100vh - 200px); max-width: calc(100vw - 600px) !important;}'+//'+highitemimage+'px '+widthitemimage+'px
'video.item-image { width: auto;}'+
'div.video-position-bar { max-width: calc(100vw - 600px) !important;}'+//'+widthitemimage+'px
'div.item-tags { height: 37px; padding: 4px 0 8px 240px !important;}'+
'#head-menu { left: 200px; position: absolute;}'+
'div.in-pane { margin-left: -5px}'+

'#filter-menu { left: 318px !important;}'+
'#footer-links { line-height: 1.6 !important; text-align: center !important; top: 7px; left: auto !important; right: 340px !important; height: 20px; width: 160px !important; bottom: 0px !important; margin: 0 !important}'+
'#footer-links a { color: rgb(238, 77, 46);}'+
'#footer-links div:nth-child(2n) a { color: rgb(155, 155, 155);}'+
'#footer-links div:nth-child(2n) a:hover{color:#F5F7F6;}'+
'.item-image-wrapper { margin: 0px auto;}'+//max-width: calc(100% - 600px); '+widthitemimage+'px
'div.item-vote { left: 80px;}'+
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
    window.alert("Dein Brauser unterstützt keine Version von IndexedDB. Das 'bereits angesehen' Feature wird dir nicht zur Verfügung stehen. Das pr0gramm mag dich trotzdem.");
}


function saveid() {
	//console.log('saveid');
	if ($('.item-image').length && window.location.pathname.match('/([0-9]{2,7})')) {
		var db;
		var open = indexedDB.open("UploadsSeen", 1);
		open.onsuccess = function (evt) {
			db = this.result;
			console.log("openDb Save DONE");
				var uploadid = window.location.pathname.match('/([0-9]{2,7})');
				var trans = db.transaction("uploads", "readwrite");
				trans.onsuccess = function(evt) {
					 console.log("trans saved: ", uploadid[1]);
				};
				trans.onerror = function(evt) {
					//console.log("trans Error:", evt.target.error.name);
				};
				var store = trans.objectStore("uploads");
				var requestAdd = store.add({id: uploadid[1], uploadid: uploadid[1]});	
				requestAdd.onsuccess = function(evt) {
					$('#item-' + uploadid[1]).append('<div class="seen" style="border-bottom: 1px solid  rgba(255, 72, 0, 0.84); height: 17px; background: none repeat scroll 0% 0% rgba(22, 22, 24, 0.7); position: relative; width: 128px; top: -17px;"><img style="opacity: 0.7; margin:auto; width:13px; padding-top: 1px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAABJ0AAASdAHeZh94AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAADRSURBVHjajNI9TgJRFMXx3+AgxMpIjI1hD5TExC1AZ0dhS2FtIpXaU7EBKiiMrsDKxIqCBZgYNkDDDAV+NI9kMoFhTndvzj/33PdutEoT6KOHI/v1izc8x7jDEAukBdAxnlCLVmnyFRqXDusDFzGWqCmnJaqVkDUuMHbQzET8q+QMJ2hl6ke84jRryk84xwy3qOMBV5gXQd+4wSTUbXzm8+7aZYoN1ruALRThJ9d/2fMomy10FsAyqqMRY4xB+LjkwEVcYxSF27tHt8Skdwz+BwAIXSigFHjUGwAAAABJRU5ErkJggg=="></div>');
					 console.log("ID saved: ", uploadid[1]);
				};
				requestAdd.onerror = function(evt) {
					//console.log("Save Error:", evt.target.error.name);
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
	}
}

function show_seenids() {
	//console.log('show_seenids');
	if ($('#stream').length) {
		var ids = 0;
		var db;
		var open = indexedDB.open("UploadsSeen", 1);
		open.onsuccess = function (evt) {
			db = this.result;
			console.log("show_seenids: openDb Read DONE");
			var trans = db.transaction("uploads", "readonly");
			var store = trans.objectStore("uploads");
			//var index = store.Index('uploadid');
			if (window.location.pathname.match('/(top)')) {
				var first = 'item-999999';
			}else{
				var first = $('.stream-row a:first').attr('id');
			}
			var last = $('#stream .stream-row:last').find('a:last').attr('id');
			//if (!first || !last) {
				//return saveid();
			//}
			var range = IDBKeyRange.bound(last.slice(5), first.slice(5));
			store.openCursor(range, 'prevunique').onsuccess = function(event) {
				var cursor = event.target.result;
				var value = parseInt(cursor.value.uploadid);
				if (cursor) {
					
					if ($('#item-' + value).children('div.seen').length == 0) {
						$('#item-' + value).append('<div class="seen" style="border-bottom: 1px solid  rgba(255, 72, 0, 0.84); height: 17px; background: none repeat scroll 0% 0% rgba(22, 22, 24, 0.7); position: relative; width: 128px; top: -17px;"><img style="opacity: 0.7; margin:auto; width:13px; padding-top: 1px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAABJ0AAASdAHeZh94AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAADRSURBVHjajNI9TgJRFMXx3+AgxMpIjI1hD5TExC1AZ0dhS2FtIpXaU7EBKiiMrsDKxIqCBZgYNkDDDAV+NI9kMoFhTndvzj/33PdutEoT6KOHI/v1izc8x7jDEAukBdAxnlCLVmnyFRqXDusDFzGWqCmnJaqVkDUuMHbQzET8q+QMJ2hl6ke84jRryk84xwy3qOMBV5gXQd+4wSTUbXzm8+7aZYoN1ruALRThJ9d/2fMomy10FsAyqqMRY4xB+LjkwEVcYxSF27tHt8Skdwz+BwAIXSigFHjUGwAAAABJRU5ErkJggg=="></div>');
					}
					ids++;
					cursor.continue();
				}else{
					// wird nicht aufgerufen
					console.log("show_seenids: No more entries!", ids);
					//add_seen_marker();
				}
			};
			store.openCursor(range, 'prevunique').onerror = function(event) {
				console.log("show_seenids: Db Read Error: ", event);
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

// bereits gesehen Markierung laden
function add_seen_marker() {
	if (!$('.seen_marker').length && $('#brille').hasClass('active')) {
		var id = window.location.pathname.match('/([0-9]{2,7})');
		if ($('#item-' + id[1] + ' > div.seen').length) {
			$('.item-container-content').append('<span class="seen_marker" style="font-size: 0.8em; right: 80px; position: absolute; top: 20px;padding-left: 120px; color: #A7D713;">[Bereits gesehen]</span>');
		}
	}
}

var inbox = document.getElementById('inboxLink'),
    b = document.createElement('span'),
    getCookie = function(name) {
        var value = "; " + document.cookie,
            parts = value.split("; " + name + "=");
        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    },
    get = function (url, success, error) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                var data = JSON.parse(request.responseText);
                success(data);
            } else {
            }
        };

        request.onerror = function() {
          error();
        };

        request.send();
    },
    update = function() {
		var cock = unescape(getCookie('me'));
		if (cock == "undefined") return;
        var me = JSON.parse(cock);
        get('http://pr0gramm.com/api/user/info?self=true&flags=7&name=' + escape(me.n), function(data){
            b.innerHTML = data.user.score;
        });
    };

// Observer für Seitenänderung
    observeDOM = (function(){
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
            eventListenerSupported = window.addEventListener;

        return function(obj, callback, subtree){
            if( MutationObserver ){
                var obs = new MutationObserver(function(mutations, observer){
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length){
                        callback(mutations);
                    }
                });
                obs.observe(obj, {
                    childList: true, 
                    subtree: subtree
                });
            }
            else if( eventListenerSupported ){
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
            }
        }
    })();

label = document.createElement('div');
b.style.cssText = 'background-image: url("http://i.imgur.com/7Q2UJeU.png"); background-repeat: no-repeat; background-size: contain; background-position: left; padding-left: 20px; display: inline-box; height: 20px; margin-left: 12px;';
var attr = document.createAttribute("title"); 
attr.value = 'Dein Benis';
b.setAttributeNode(attr);
label.className = 'date-label';
label.style.cssText = 'position: absolute; left: 0px; right: 0px; bottom: 0px; text-align: center; font-size: 10px; color: #FFFFFF !important; text-shadow: 1px 1px 0px black, 1px -1px 0px black, -1px 1px 0px black, -1px -1px 0px black; background-color: rgba(0,0,0,.5);';
inbox.parentNode.insertBefore(b, inbox);
update();
setInterval(update, 40000);

observeDOM(
    document.getElementById('page'),
    function(elements){
		$.each(elements, function(idx, obj) {
			var test = jQuery(obj.target);
			var value = test[0].id || test[0].className;
			//console.log(test);
			if (value.length > 12 && value.match('(item-comments)')) value = 'item-comments';
			switch(value) {
				case "main-view":
					//console.log('header geladen');
					headerchange();
				break;
				case "stream":
					//console.log('stream changed');
					streamchange();
				break;
				case "item-container":
					//console.log('neues Bild geöffnet');
					imagechange();
					//commentschange();
				break;
				case "item-comments":
					//console.log('Comments geladen');
					commentschange();
				break;
			}
		});
		


    },
    true
);

function commentschange() {
			// FadeIn Effekt für Kommentarspalte
			if ($('.comments').length) {
					$('.comments-head').css('display', 'block');
					$('.comment-form').css('display', 'block');
					$('.comments').css('display', 'block');
					/*$('.comments-head').fadeIn(300);
				    $('.comment-form').fadeIn(300);
				    $('.comments').fadeIn(300);*/
			}
			
		   // Custom Scrollbar laden in den Comments, nicht bei Chrome
		   if (!is_chrome && $('.item-comments').length && !$('.item-comments').hasClass('scroll')) {
			  if ($('.comments').height() > ($('.item-comments').height()-130)) {
				 ssb.scrollbar('item-comments');
				 $('.item-comments').addClass('scroll');
				 $('.item-comments').attr('style', 'border-right: 0 !important; background: rgba(23, 23, 24, 0.45) !important');
				 $('.item-comments:first').css('overflow', 'hidden');
				 if (is_chrome) {
					$('.item-comments .second').attr('style', function(i,s) { return 'top: 0px !important;' + s });
				 }
			  }
		   }
		
			// Kommentaransicht ändern
			if ($('.item-comments').length) {
				// nur einmalig einbinden
				var event = $._data( $('.commentview')[0], 'events' );
				if (!event) {
					$('span.commentview').click(function() {
						$("div.item-container-content").toggleClass("wide");
						$("div.item-comments").each(function(index) {
							$(this).toggleClass("wide");
						});
				
						//Scrollbalken anpassen
						if (!is_chrome) {
							if (!$('.item-comments').hasClass('scroll')) {
								if ($('.comments').height() > ($('.item-comments').height()-130)) {
									ssb.scrollbar('item-comments');
									$('.item-comments').addClass('scroll');
									$('.item-comments').attr('style', 'border-right: 0 !important; background: rgba(23, 23, 24, 0.45) !important');
									$('.item-comments:first').css('overflow', 'hidden');
									 if (is_chrome) {
										$('.item-comments .second').attr('style', function(i,s) { return 'top: 0px !important;' + s });
									 }
								}
							}else{
								ssb.refresh();
							}
						}
						$("span.vote-fav").toggleClass("wide");
						var value = $("div.item-container-content").hasClass("wide") ? 'wide' : 'normal';
						localStorage.setItem('commentview', value);
						return false;
					});
				}
			}
		
			// Kommentarsortierung laden
			if (!$('#com-new').hasClass('active') && !$('#com-top').hasClass('active')) {
				if (localStorage.getItem("comorder") != null) {
					$('#com-' + localStorage.getItem('comorder')).addClass('active');
				}else{
					$('#com-top').addClass('active');
				}
			}
			
			// Click Events für Sortierung
			if ($('#com-new').length) {
				$('#com-new').click(function() {
					localStorage.removeItem('comorder');
					$('#com-new').addClass('active');
					$('#com-top').removeClass('active');
					localStorage.setItem('comorder', 'new');
					window.location.reload(true);
					return false;
				});
				$('#com-top').click(function() {
					localStorage.removeItem('comorder');
					$('#com-top').addClass('active');
					$('#com-new').removeClass('active');
					localStorage.setItem('comorder', 'top');
					window.location.reload(true);
					return false;
				});

			}
	
			// Zu Kommentar springen
			var commentid = window.location.pathname.split(':comment')[1];
			if (commentid) {
				var top = document.getElementById('comment' + commentid).offsetTop - 20;
				$('.item-comments').scrollTop(top);
			}
}

function imagechange() {

	$('.item-image-wrapper').click(function() {
		$('.item-image:visible').click();
	});

			// bereits gesehen Markierung
			if ($('#brille').hasClass('active')) {
				saveid();
				//add_seen_marker();
			}
	
			// + bei resized Bildern hinzufügen
			if (!$('.item-fullsize-link').length) {
				var imgu = document.getElementsByClassName('item-image')[0];
				if (imgu.naturalHeight > 460) {
					var link = imgu.getAttribute('src');
					$('.item-image-wrapper').append('<a class="item-fullsize-link" target="_blank" href="'+link+'" style="">+</a>');
				}
			}
			
			// Scrollbar in Bildansicht ausblenden
			var stil = document.getElementsByTagName('html')[0];
			if (stil.style.overflow != 'hidden') {
				stil.style.overflow = 'hidden';
			}
			
			// zum passenden Thumb scrollen
			var itemId = document.URL;
			var itemname = '#item-' + itemId.substring(itemId.length - 6, itemId.length);
			var posi = $(itemname).offset().top - 52;
			if ($(window).scrollTop() != posi) {
				//window.scrollTo(0, posi); //ohne Animation
				$('html').stop();
				$('html').animate({scrollTop: posi}, 300, 'swing', function() { return;});
			}
}

function streamchange() {
		if (!$('.item-container').length) {
			var stil = document.getElementsByTagName('html')[0];
			if (stil.style.overflowX != 'hidden' || stil.style.overflowY != 'auto') {
				stil.style.overflowX = 'hidden';	
				stil.style.overflowY = 'auto';	
			}
		}
		
		// Bereits gesehen Markierungen in den thumbs
		if ($('#brille').hasClass('active')) {
			//console.log('streamchange_show_seenids');
			show_seenids();
		}
			
			// SlideIn Effekt für Comments
			if ($('.stream-row').length) {
				$('.stream-row a').click(function() {
					if (!$('.item-comments:first').hasClass('fadeInLeft')) {
						$('.item-comments:first').addClass('fadeInLeft');
						$('.item-comments:first').css({'-webkit-animation-duration': '1s', 'animation-duration': '1s', '-webkit-animation-fill-mode': 'both', 'animation-fill-mode': 'both'}); 
					}
				});
			}
			
			// Seite zentrieren links/rechts
			if ($('div#stream').css('margin-left') == '0px') {
				var mainwidth = $('#main-view' ).width();
				var margin = (mainwidth-(Math.floor(mainwidth/132)*132))/2-15 + 'px';
				$('div#stream').css('margin-left', margin);
			}
		
}

function headerchange() {
		if (!$('.item-container').length) {
			var stil = document.getElementsByTagName('html')[0];
			if (stil.style.overflowX != 'hidden' || stil.style.overflowY != 'auto') {
				stil.style.overflowX = 'hidden';	
				stil.style.overflowY = 'auto';	
			}
		}

			// Bereits gesehen Button, nur einmal einbinden
				var event = $._data( $('#brille')[0], 'events' );
			if ($('#brille').length && !event) {
			
				$('#brille').click(function() {
					$('#brille').toggleClass("active");
					var value = $("#brille").hasClass("active")? 'on' : 'off';
					localStorage.setItem('alreadyseen', value);
					if ($('#brille').hasClass('active')) {
						$('.seen').css('display', 'block');
						$('.seen_marker').css('display', 'block');
						if ($('.item-container').length) saveid();
						show_seenids();
					}else{
						$('.seen').css('display', 'none');
						$('.seen_marker').css('display', 'none');
					}
					return false;
				});
			}

			// Random Button aktualisieren
			if (document.getElementById('random').getAttribute('href') == '') prepareButton();
}
	
// Space Vergrößerung und links/rechts Bildwechsel
document.addEventListener("keydown", keydown, false);

	function startDrag(e) {
            // determine event object
            if (!e) {
                var e = window.event;
            }
            if(e.preventDefault) e.preventDefault();

            // IE uses srcElement, others use target
            targ = e.target ? e.target : e.srcElement;

            //if (targ.className != 'dragme') {return};
            // calculate event X, Y coordinates
                offsetX = e.clientX;
                offsetY = e.clientY;

            // assign default values for top and left properties
            if(!targ.style.left) { targ.style.left='0px'};
            if (!targ.style.top) { targ.style.top='0px'};

            // calculate integer values for top and left 
            // properties
            coordX = parseInt(targ.style.left);
            coordY = parseInt(targ.style.top);
            drag = true;

            // move div element
            document.onmousemove = dragDiv;
            return false;

        }
        
		function dragDiv(e) {
            if (!drag) {return};
            if (!e) { var e= window.event};
            // var targ=e.target?e.target:e.srcElement;
            // move div element
            targ.style.left=coordX+e.clientX-offsetX+'px';
            targ.style.top=coordY+e.clientY-offsetY+'px';
            return false;
        }
        
		function stopDrag() {
            drag=false;
        }
var clickevent;
function keydown(event) {
	if (event.keyCode == '32') {
		
		// falls textarea aktiv
		var el = document.activeElement;
		if (el && (el.tagName.toLowerCase() == 'input' && el.type == 'text' || el.tagName.toLowerCase() == 'textarea')) {
			return;
		}
		
		// Bild mit Space vergrößern
		if ($('.item-image').length) {
			event.preventDefault();
			event.stopPropagation();

			if (!spacepressed) {
				$(".item-image").css({ 'max-height': '100%', 'cursor': 'move', 'position': 'relative'});
				spacepressed = true;
				var events = $._data($('.item-image')[0], 'events');
				clickevent = events.click[0].handler;
				$(".item-image").mousedown(function(e){
					$(".item-image").unbind("click");
					startDrag(e);
				});
				$(".item-image").mouseup(function(e){
					stopDrag(e);
				});
			}else{
				$(".item-image").unbind("mousedown");
				$(".item-image").bind("click", clickevent);
				$(".item-image").css({ 'left': '0px', 'top': '0px', 'max-height': '562px', 'cursor': 'pointer'});
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
            $('.stream-next').click();
		}else{
            $('.stream-prev').click();
		}
	}
}

function isHover(e) {
if (!e) return false;
    return (e.parentElement.querySelector(':hover') === e);
}


// Code für den Random Button     
    function prepareButton() {
			if ($('.stream-row a:first').length) {
				var str = $('.stream-row a:first').attr('id');
				lastId = str.slice(5, str.length);
			}else{
				lastId = 620000;
			}
			localStorage.setItem('pr0latestId', lastId);
		var imageId = Math.floor((Math.random() * lastId) + 1);
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
		else if (cont_id == 'html') { var cont = document.getElementsByTagName('html')[0];}

        // perform initialization
        if (! ssb.init()) return false;

        var cont_clone = cont.cloneNode(false);
        cont_clone.style.overflow = "hidden";
        cont.parentNode.appendChild(cont_clone);
        cont_clone.appendChild(cont);
		
        cont.className = cont.className.replace("fadeInLeft", "");
		cont.className += ' second';
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
               this.ratio = this.offsetHeight / ($('.comments').outerHeight(true) + 131);//187+33
			}else{
				this.ratio = ($(window).height()-52) / ($('.comments').outerHeight(true) + 187 + 53); //#main-view
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
			o.st.style.height =  $(window).height() - 51 + 'px'; //'#main-view'
            o.sb.style.height = Math.ceil(o.ratio * ($(window).height() - 51)) + 'px';
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

		
})();
