( function ( $ ) {
	
	var defaults = {
	
		stage: 'stage',
		play: 'play',
		pause: 'pause',
		playpause: 'playpause',
		progress: 'progress',
		seeker: 'seeker',
		buffer: 'buffer',
		playing: 'playing',
		time: 'time',
		mute: 'mute',
		mute: 'muted',
		duration: 'duration',
		volume: 'volume',
		volumectrl: 'volumectrl',
		
		axisprogress: 'x',
		axisbuffer: 'x',
		axisseeker: 'x',
		axisvolume: 'x',
		axisvolumectrl: 'x',
		
		swf: 'jbrid.swf',
		
		fs: true,
		autoplay: false,
		minbuffer: 0,
		defaultVolume: 1,
		force: false,
		delimeter: ':'
		
	}
	
	var timers = {
		fast: 250,
		medium: 500,
		slow: 1000
	}
	
	var events = {
		ready: 'ready',
		complete: 'complete',
		playing: 'playing',
		timeupdate: 'timeupdate',
		loading: 'loading',
		muted: 'muted',
		volume: 'volume'
	}
	
	var prefix = 'jbrid';
	
	var methods = {
		
		init: function ( settings ) {
			
			return this.each ( 
				function() {
					
					__setSettings($(this), $.extend ( defaults, settings, $(this).data() ) );
					__setUnique($(this));
					__switch($(this));
					__stage($(this));
					__events($(this));
					__binds($(this));
					
				}
			)
			
		},
		
		play: function () {
			
			return this.each( 
				function() {
					if ( __getSetting($(this), 'isReady') ) {
						var player = $(this).data('player');
						__useVideo($(this)) ? player.play() : player.vidPlay();
						__setPlaying($(this), true);
					}
					
				}
			);
			
		},
		
		pause: function () {
			
			return this.each( 
				function() {
					
					if ( __getSetting($(this), 'isPlaying') ) {
						var player = $(this).data('player');
						__useVideo($(this)) ? player.pause() : player.vidPause();
						__setPlaying($(this), false);
					}
					
				}
			);
			
		},
		
		mute: function () {
			
			return this.each( 
				function() {
					
					__setMuted ( $(this), true );
					__setVolume ( $(this), 0 );
					
				}
			);
			
		},
		
		unmute: function () {
			
			return this.each(
				function () {
					
					__setMuted ( $(this), false );
					__setVolume ( $(this), __getSetting ( $(this), 'storedVolume' ) );
					
				}
			)
			
		}
		
	}
	
	$.fn.jbrid = function ( method ) {  

		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}else if(typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		}

	};
	
	function __supportsVideo () {
		
		return !!document.createElement('video').canPlayType;
		
	}
	
	function __useVideo ( el ) {
		
		return __getSetting ( el, 'video' );
		
	}
	
	function supportsFlash () {
		
		return !!(navigator.mimeTypes["application/x-shockwave-flash"] || window.ActiveXObject && new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));
		
	}
	
	function __setSettings ( el, object ) {
		
		var settings = el.data('settings');
		settings = $.extend({}, settings, object);
		el.data('settings', settings);
		
	}
	
	function __getSetting ( el, key ) {
		
		var settings = el.data('settings');
		return settings[key];
		
	}
	
	function __setUnique ( el ) {
		
		__setSettings ( el, { unique: Math.ceil ( Math.random() * 1000 ) } );
		
	}

	function __switch ( el ) {
		
		if ( __getSetting(el, 'force') == 'video' ) {
			__setSettings ( el, { video: true } );
		} else if ( __getSetting(el, 'force') == 'flash' ) {
			__setSettings ( el, { video: false } );
		} else if ( __supportsVideo() ) {
			__setSettings ( el, { video: true } );
		} else {
			__setSettings ( el, { video: false } );
		}
		
	}
	
	function __stage ( el ) {

		if ( !__getSetting(el, 'src') ) return false;
		var stage = el.find(__getClassSelector(__getSetting(el, 'stage')));
		var player = false;
		
		if ( __useVideo(el) ) {
			
			var reset = {
				'width': '100%',
				'height': '100%',
				'display': 'block',
				'padding': 0,
				'margin': 0,
				'border': 0
			};
			
			var scr = $('<video src="' + __getSetting(el, 'src') + '"></video>');
			scr.attr('id', __getVideoId(el));
			scr.css(reset);
			stage.html(scr);
			
			player = $('#' + __getVideoId(el))[0];
			
		} else {
			
			scr = $('<div></div>');
			scr.attr('id', __getVideoId(el));
			stage.html(scr);
			
			var flash = {
				vars: {
					vidUrl: __getSetting(el, 'src'),
					autoPlay: __getSetting(el, 'autoplay'),
					minBuffer: __getSetting(el, 'minbuffer')
				},
				params: {
					allowFullScreen: __getSetting(el, 'fs'),
					scale: 'noScale', 
					salign: 'lt', 
					menu: 'false', 
					allowScriptAccess: 'always', 
					allowNetworking: 'all', 
					wmode: 'transparent'
				},
				attr: {
					id: __getVideoId(el),
					name: __getVideoId(el)
				}
			};
			
			swfobject.embedSWF (
				__getSetting(el, 'swf'), 
				__getVideoId(el), 
				'100%', 
				'100%', 
				'10', 
				null, 
				flash.vars, 
				flash.params, 
				flash.attr
			);
			
			player = __getFlash(el);
			
		}
		
		el.data ( 'video', $('#' + __getVideoId(el)) );
		el.data ( 'player', player );
		
	}
	
	function __events ( el ) {
		
		if ( __useVideo(el) ) var video = el.data('video');
		
		if ( __useVideo(el) ) {
			
			video.on ( __getBindName(el, 'canplay'), 
				function () { 
					el.trigger ( events.ready );
					__setSettings ( el, { isReady: true } );
				} 
			);
			
			video.on ( __getBindName(el, 'progress'), 
				function () { 
					el.trigger ( events.loading );
				} 
			);
			
			video.on ( __getBindName(el, 'timeupdate'), 
				function () { 
					el.trigger ( events.timeupdate );
					if ( __isComplete ( el ) ) el.trigger ( events.complete );
				} 
			);
			
		} else {
			
			__setSettings(el, { intervalReady: __flashSetReady ( el ) });
			
		}
		
	}
	
	function __binds ( el ) {
		
		el.bind (__getBindName(el, events.ready),
			function () {
				clearInterval ( __getSetting ( el, 'intervalReady' ) );
				__setVolume ( el, __getSetting ( el, 'defaultVolume' ) );
			}
		)
		
		var play = el.find(__getClassSelector(__getSetting(el, 'play')));
		play.bind(__getBindName(el, 'click'),
			function ( e ) {
				e.preventDefault();
				el.jbrid('play');
			}
		);
		
		var pause = el.find(__getClassSelector(__getSetting(el, 'pause')));
		pause.bind(__getBindName(el, 'click'),
			function ( e ) {
				e.preventDefault();
				el.jbrid('pause');
			}
		);
		
		var playpause = el.find(__getClassSelector(__getSetting(el, 'playpause')));
		playpause.bind(__getBindName(el, 'click'),
			function ( e ) {
				e.preventDefault();
				__isPlaying(el) ? el.jbrid('pause') : el.jbrid('play');
			}
		);
		
		var mute = el.find(__getClassSelector(__getSetting(el, 'mute')));
		mute.bind(__getBindName(el, 'click'),
			function ( e ) {
				e.preventDefault();
				!__getSetting ( el, 'isMuted' ) ? el.jbrid('mute') : el.jbrid('unmute');
			}
		);
		
		var duration = el.find(__getClassSelector(__getSetting(el, 'duration')));
		duration.html(__formatTime(el, 0));
		el.bind (__getBindName(el, events.ready), 
			function() { 
				duration.html(__formatTime(el, __getDuration ( el ))); 
			}
		)
		
		var time = el.find(__getClassSelector(__getSetting(el, 'time')));
		var progress = el.find(__getClassSelector(__getSetting(el, 'progress')));
		time.html(__formatTime(el, 0));
		progress.css (__getSetting(el, 'axisprogress') == 'y' ? 'height' : 'width', 0);
		el.bind (__getBindName(el, events.timeupdate), 
			function() { 
				time.html(__formatTime(el, __getTime ( el )));
				progress.css(__getSetting(el, 'axisprogress') == 'y' ? 'height' : 'width', __percentCss(__getPctComplete(el)));
			}
		)
		
		var buffer = el.find(__getClassSelector(__getSetting(el, 'buffer')));
		buffer.css(__getSetting(el, 'axisbuffer') == 'y' ? 'height' : 'width', 0);
		el.bind (__getBindName(el, events.loading), 
			function() { 
				buffer.css(__getSetting(el, 'axisbuffer') == 'y' ? 'height' : 'width', __percentCss(__getPctBuffered(el)));
			}
		)
		
		var volume = el.find(__getClassSelector(__getSetting(el, 'volume')));
		volume.css(__getSetting(el, 'axisvolume') == 'y' ? 'height' : 'width', 0);
		el.bind (__getBindName(el, events.volume), 
			function() { 
				volume.css(__getSetting(el, 'axisvolume') == 'y' ? 'height' : 'width', __percentCss(__getVolume(el)));
			}
		)
		
		var seeker = el.find(__getClassSelector(__getSetting(el, 'seeker')));
		seeker.bind (__getBindName(el, 'mousedown'),
			function ( e ) {
				e.preventDefault ();
				__setSettings ( el, { seekerIsDraggable: true } );
			} 
		)
		seeker.bind (__getBindName(el, 'mousemove'), 
			function ( e ) {
				e.preventDefault ();
				if ( __useVideo ( el ) && __getSetting ( el, 'seekerIsDraggable' ) ) __seek ( el, __seekerNumber ( el, e ) );
			} 
		);
		
		var volumectrl = el.find(__getClassSelector(__getSetting(el, 'volumectrl')));
		volumectrl.bind (__getBindName(el, 'mousedown'),
			function ( e ) {
				e.preventDefault ();
				__setSettings ( el, { volumeCtrlIsDraggable: true } );
			} 
		)
		volumectrl.bind (__getBindName(el, 'mousemove'), 
			function ( e ) {
				e.preventDefault ();
				if ( __useVideo ( el ) && __getSetting ( el, 'volumeCtrlIsDraggable' ) ) __setVolume ( el, __volumeCtrlNumber ( el, e ) );
			} 
		);
		
		$(window).bind (__getBindName(el, 'mouseup'), 
			function ( e ) {
				e.preventDefault ();
				if ( !__useVideo ( el ) && __getSetting ( el, 'seekerIsDraggable' ) ) __seek ( el, __seekerNumber ( el, e ) );
				if ( !__useVideo ( el ) && __getSetting ( el, 'volumeCtrlIsDraggable' ) ) __setVolume ( el, __volumeCtrlNumber ( el, e ) );
				__setSettings ( el, { seekerIsDraggable: false } );
				__setSettings ( el, { volumeCtrlIsDraggable: false } );
			} 
		);
		
	}
	
	function __getVideoId ( el ) {
		
		return 'video' + __getSetting(el, 'unique');
		
	}
	
	function __getFlash ( el ) {
		
		var id = __getVideoId(el);
		
		if ( window.document[id] ) {
			return window.document[id];
		}
		
		if ( navigator.appName.indexOf("Microsoft Internet")==-1 
		&& ( document.embeds && document.embeds[id] ) ) {
			return document.embeds[id];
		} else {
			return document.getElementById(id);
		}
		
	}
	
	function __getBindName ( el, e ) {
		
		return e + '.' + __getVideoId(el);
		
	}
	
	function __getTime ( el ) {
		
		var player = el.data('player');
		return __useVideo(el) ? player.currentTime : player.getCurTime();
		
	}
	
	function __getDuration ( el ) {
		
		var player = el.data('player');
		return __useVideo(el) ? player.duration : player.getTtlTime();
		
	}
	
	function __getPctComplete ( el ) {
		
		return __getTime ( el ) / __getDuration ( el );
		
	}
	
	function __getPctBuffered ( el ) {
		
		var player = el.data('player');
		if ( __useVideo(el) ) {
			return player.buffered.end(0) / __getDuration(el);
		} else if ( typeof player.getPercentLoaded() !== 'undefined' ) {
			return player.getPercentLoaded();
		}
		return false;
		
	}
	
	function __isComplete ( el ) {
		
		return __getPctComplete(el) == 1;
		
	}
	
	function __setPlaying ( el, playing ) {
		
		if ( playing ) {
			el.addClass(__getSetting(el, 'playing'));
			__setSettings ( el, { isPlaying: true } );
			if ( !__useVideo(el) ) __setSettings(el, { interval: __flashSetPlaying ( el ) });
		} else {	
			el.removeClass(__getSetting(el, 'playing'));
			__setSettings ( el, { isPlaying: false } );
			clearInterval ( __getSetting ( el, 'interval' ) );
			if ( !__useVideo(el) ) __setSettings(el, { interval: null });
		}
		
	}
	
	function __formatTime ( el, secs ) {
		
		var seconds = Math.floor ( secs );
		var hours = Math.floor ( seconds / 3600 );
		
		seconds -= hours * 3600;
		var minutes = Math.floor ( seconds / 60 );
		seconds -= minutes * 60;

		seconds = seconds > 9 ? "" + seconds : "0" + seconds;
		minutes = minutes > 9 ? "" + minutes : "0" + minutes;
		
		var format = minutes + __getSetting(el, 'delimeter') + seconds;
		if ( hours > 0 ) {
			format = hours + __getSetting(el, 'delimeter') + format;
		}
		
		return format;
		
	}
	
	function __isPlaying ( el ) {
		
		return __getSetting(el, 'isPlaying');
		
	}
	
	function __getClassSelector ( selector ) {
		
		return '.' + selector;
		
	}
	
	function __percentCss ( num ) {
		
		return num * 100 + '%';
		
	}
	
	function __flashSetReady ( el ) {
		
		return setInterval (
			function () {
				if ( __getPctBuffered ( el ) == 1 ) {
					el.trigger ( events.loading );
					el.trigger ( events.ready );
					__setSettings ( el, { isReady: true } );
				} else {
					el.trigger ( events.loading );
				}
			}, timers.fast
		)
		
	}
	
	function __flashSetPlaying ( el ) {
		
		return setInterval (
			function () {
				el.trigger ( events.timeupdate );
			}, timers.fast
		)
		
	}
	
	function __seek ( el, num ) {
		
		if ( num ) {
			
			var player = el.data('player');
			if ( __useVideo(el) ) {
				player.currentTime = num;
			} else if ( !__useVideo(el) && __getSetting(el, 'isReady') ) {
				player.vidSeek ( num );
				el.trigger ( events.timeupdate );
			}
			
		}
		
	}
	
	function __seekerNumber ( el, e ) {
	
		var seeker = el.find(__getClassSelector(__getSetting(el, 'seeker')));
		var pos;
		var dist;
		var offset;
		
		if ( __getSetting(el, 'axisseeker') == 'y' ) {
			pos = e.pageY;
			dist = seeker.height();
			offset = seeker.offset().top;
		} else {
			pos = e.pageX;
			dist = seeker.width();
			offset = seeker.offset().left;
		}
		
		if ( pos >= offset && pos <= offset + dist ) {
			var pct = (pos - offset) / dist;
			return __getDuration ( el ) * pct;
		}
		
		return false;
		
	}
	
	function __setVolume ( el, num ) {
		
		var player = el.data('player');
		
		if ( num > 0 ) {
			__setMuted ( el, false );
		}
		
		if ( __useVideo ( el ) ) {
			player.volume = num;
		} else {
			player.vidVolume ( num );
			__setSettings ( el, { flashVolume: num } );
		}	
		
		el.trigger ( events.volume );
		
	}
	
	function __volumeCtrlNumber ( el, e ) {
		
		var volumeCtrl = el.find(__getClassSelector(__getSetting(el, 'volumectrl')));
		var pos;
		var dist;
		var offset;
		
		if ( __getSetting(el, 'axisvolumectrl') == 'y' ) {
			pos = e.pageY;
			dist = volumeCtrl.height();
			offset = volumeCtrl.offset().top;
		} else {
			pos = e.pageX;
			dist = volumeCtrl.width();
			offset = volumeCtrl.offset().left;
		}
		
		if ( pos >= offset && pos <= offset + dist ) {
			var pct = ( pos - offset ) / dist;
			return pct;
		} 
		
		return false;
		
	}
	
	function __getVolume ( el ) {
		
		var player = el.data('player');
		return __useVideo ( el ) ? player.volume : __getSetting ( el, 'flashVolume' );
		
	}
	
	function __setMuted ( el, muted ) {
		
		if ( muted ) {
			__setSettings ( el, { isMuted: true } );
			__setSettings ( el, { storedVolume: __getVolume(el) } );
			el.addClass(__getSetting(el, 'muted'));
			el.trigger ( events.muted );
		} else {
			__setSettings ( el, { isMuted: false } );
			el.removeClass(__getSetting(el, 'playing'));
		}
		
	}
	
	
})( jQuery );


/*
 *
 * SWFObject v2.2 <http://code.google.com/p/swfobject/> 
 * is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
 *
 */

var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();