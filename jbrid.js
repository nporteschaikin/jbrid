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
		muted: 'muted',
		duration: 'duration',
		volume: 'volume',
		volumectrl: 'volumectrl',
		
		axisprogress: 'x',
		axisbuffer: 'x',
		axisseeker: 'x',
		dirseeker: 'tl',
		axisvolume: 'x',
		axisvolumectrl: 'x',
		dirvolumectrl: 'tl',
		
		swf: 'jbrid.swf',
		
		fs: false,
		fsbalign: 'tr',
		fsboffsetx: 10,
		fsboffsety: 10,
		autoplay: false,
		minbuffer: 0,
		defaultVolume: 1,
		force: false,
		delimeter: ':'
		
	},
	
	timers = {
		fast: 250,
		medium: 500,
		slow: 1000
	},
	
	events = {
		ready: 'ready',
		complete: 'complete',
		playing: 'playing',
		play: 'play',
		stop: 'stop',
		timeupdate: 'timeupdate',
		loading: 'loading',
		muted: 'muted',
		volume: 'volume'
	},
	
	prefix = 'jbrid',
	
	methods = {
		
		init: function ( settings ) {
			
			return this.each ( 
				function() {
					
					__setSettings($(this), $.extend ( {}, defaults, settings, $(this).data() ) );
					__setUnique($(this));
					__load($(this));
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
		
		volume: function ( num ) {
			
			return this.each(
				function() {
					
					__setVolume ( $(this), num );
					
				}
			)
			
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
		} else if ( __supportsFlash() ) {
			__setSettings ( el, { video: false } );
		} else {
			return false;
		}
		
	}
	
	function __load ( el ) {
		
		$('<object data="' + __getSetting(el, 'swf') + '"></object>').load();
		$('<object data="' + __getSetting(el, 'src') + '"></object>').load();
		
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
			
			stage.html(__flashObj(el));
			player = __getFlash(el);
			
		}
		
		el.data ( 'video', $('#' + __getVideoId(el)) );
		el.data ( 'player', player );
		
	}
	
	function __events ( el ) {
		
		if ( __useVideo(el) ) {
			
			var video = el.data('video');
			
			video.on ( __getBindName(el, 'canplay'), 
				function () { 
					__setSettings ( el, { isReady: true } );
					el.trigger ( events.ready );
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
				if ( __getSetting ( el, 'autoplay' ) ) el.jbrid('play');
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
	
	function __flashObj ( el ) {
		
		var obj = $('<object type="application/x-shockwave-flash"></object>');
		var param;
		var flash = {
			vars: {
				vidUrl: __getSetting(el, 'src'),
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
			}
		};
	
		obj.attr ( 'id', __getVideoId(el) );
		obj.attr ( 'name', __getVideoId(el) );
		obj.attr ( 'data', __getSetting(el, 'swf') );
		obj.attr ( 'width', '100%' );
		obj.attr ( 'height', '100%' );
		obj.css ( 'visibility', 'visible' );
		
		flash.params = $.extend ( flash.params, { flashVars: $.param ( flash.vars, false ) } );
		
		$.each ( flash.params,
			function ( key,value ) {
				param = $('<param />');
				param.attr ( 'name', key );
				param.attr ( 'value', value );
				obj.append ( param );
			}
		)
		
		return obj;
		
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
			el.trigger ( events.play );
		} else {	
			el.removeClass(__getSetting(el, 'playing'));
			__setSettings ( el, { isPlaying: false } );
			clearInterval ( __getSetting ( el, 'interval' ) );
			if ( !__useVideo(el) ) __setSettings(el, { interval: null });
			el.trigger ( events.stop );
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
					__setSettings ( el, { isReady: true } );
					el.trigger ( events.loading );
					el.trigger ( events.ready );
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
		var pct;
		
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
			__getSetting(el, 'dirseeker') == 'br' ? pct = 1 - ( ( pos - offset ) / dist ) : pct = ( pos - offset ) / dist;
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
		var pct;
		
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
			__getSetting(el, 'dirvolumectrl') == 'br' ? pct = 1 - ( ( pos - offset ) / dist ) : pct = ( pos - offset ) / dist;
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
			el.removeClass(__getSetting(el, 'muted'));
		}
		
	}
	
	
})( jQuery );