
;(function(plugin) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], plugin);
	} else {
		plugin(jQuery);
	}
}(function($) {
	var URI = location.href.replace(/#.*/, ''); 

	var $localScroll = $.localScroll = function(settings) {
		$('body').localScroll(settings);
	};

	$localScroll.defaults = {
		duration: 1000,
		axis: 'y',
		event: 'click', 
		stop: true, 
		target: window, 
		autoscroll: true 
	
	};

	$.fn.localScroll = function(settings) {
		settings = $.extend({}, $localScroll.defaults, settings);

		if (settings.autoscroll && settings.hash && location.hash) {
			if (settings.target) window.scrollTo(0, 0);
			scroll(0, location, settings);
		}

		return settings.lazy ?
			// use event delegation, more links can be added later.
			this.on(settings.event, 'a,area', function(e) {
				if (filter.call(this)) {
					scroll(e, this, settings);
				}
			}) :
			// bind concretely, to each matching link
			this.find('a,area')
				.filter(filter).bind(settings.event, function(e) {
					scroll(e, this, settings);
				}).end()
			.end();

		function filter() {// is this a link that points to an anchor and passes a possible filter ? href is checked to avoid a bug in FF.
			return !!this.href && !!this.hash && this.href.replace(this.hash,'') === URI && (!settings.filter || $(this).is(settings.filter));
		}
	};

	// Not needed anymore, kept for backwards compatibility
	$localScroll.hash = function() {};

	function scroll(e, link, settings) {
		var id = link.hash.slice(1),
			elem = document.getElementById(id) || document.getElementsByName(id)[0];

		if (!elem) return;

		if (e) e.preventDefault();

		var $target = $(settings.target);

		if (settings.lock && $target.is(':animated') ||
			settings.onBefore && settings.onBefore(e, elem, $target) === false)
			return;

		if (settings.stop) {
			$target.stop(true); 
		}

		if (settings.hash) {
			var attr = elem.id === id ? 'id' : 'name',
				$a = $('<a> </a>').attr(attr, id).css({
					position:'absolute',
					top: $(window).scrollTop(),
					left: $(window).scrollLeft()
				});

			elem[attr] = '';
			$('body').prepend($a);
			location.hash = link.hash;
			$a.remove();
			elem[attr] = id;
		}

		$target
			.scrollTo(elem, settings) // do scroll
			.trigger('notify.serialScroll',[elem]); // notify serialScroll about this change
	}

	return $localScroll;

}));
