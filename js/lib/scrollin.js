;(function() {

	'use strict';

	var version = '1.0.1',
	    pluginName = 'Scrollin\'';

	$.fn.scrollin = function(options, param) {

		var results = [];

		for(var i = 0; i < this.length; i++) {

			var self = $(this[i]);

			if(!self.data('instance') && typeof options != 'string') {

				var instance = new plugin(self, options);
				self.data('instance', instance);
				instance.private_methods.initialise();

			} else {

				var instance = self.data('instance');

				if(!instance) {

					console.log('['+pluginName+' v'+version+'] - You\'re trying to fire a method on an element with no instance!');

				} else if(instance.public_methods[options]) {

					if (this.length > 1) {

						results.push(instance.public_methods[options](param));

					} else {

						return instance.public_methods[options](param);
						
					}				

				} else {

					instance.private_methods.error(options + ' is not a defined method! Here\'s a list of methods! ---');

				}

			}

		}

		return results;

	}

	function plugin(self, options, param) {

		var instance = this;

		instance.defaults = {

			inner: null,
			track: null,
			anchor: null

		}

		var settings = $.extend(instance.defaults, options);

		var inner, track, anchor, visibleDecimal, scollLimit, hiddenDecimal, anchorLimit, paddingTop, paddingBottom,
			content = self.children(),
			isTouch = ("ontouchstart" in document.documentElement);

		instance.private_methods = {

			initialise: function() {

				instance.private_methods.setup();
				instance.private_methods.resize();

			},

			setup: function() {

				self.css({

					'overflow' : 'hidden'

				});

				for(var element in instance.private_methods.createElement) {

					instance.private_methods.createElement[element]();

				}

				for(var event in instance.private_methods.events) {

					instance.private_methods.events[event]();

				}

				instance.public_methods.update(false);

			},

			remove: function() {

				anchor.remove();
				track.remove();

				content.unwrap();

				if(window.removeEventListener) {

					container[0].removeEventListener(("onwheel" in document || document.documentMode >= 9) ? "wheel" : (document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll"), instance.private_methods.actions['wheel'], false);

				} else {

					container[0].onmousewheel = null;
					
				}

				if(isTouch) {

					container[0].ontouchstart = null;

				}

			},

			createElement: {

				inner: function() {

					if(settings.inner != null && settings.inner.size() > 0) {

						inner = settings.inner;

					} else {

						inner = $('<div />', {

									'class' : self.attr('class') + '__inner'

								});

						content.wrapAll(inner);

						inner = self.find('.'+self.attr('class') + '__inner');

						inner.css({

							'overflow' : 'hidden',
							'position' : 'relative'

						});	

					};

				},

				track: function() {

					if(settings.track != null && settings.track.size() > 0) {

						track = settings.track;

					} else {

						$('<div />', {

							'class' : self.attr('class') + '__track'

						}).appendTo(self);

						track = self.find('.'+self.attr('class') + '__track');
						
					};


				},

				anchor: function() {

					if(settings.anchor != null && settings.anchor.size() > 0) {

						anchor = settings.anchor;

					} else {

						$('<div />', {

							'class' : self.attr('class') + '__anchor'

						}).appendTo(track);

						anchor = self.find('.'+self.attr('class') + '__anchor');

						anchor.css({

							'display' : 'block',
							'position' : 'relative',
							'z-index' : '20'

						});

					};

				}				

			},

			events: {

				wheel: function() {

					if(window.addEventListener) {

						self[0].addEventListener(("onwheel" in document || document.documentMode >= 9) ? "wheel" : (document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll"), instance.private_methods.actions['wheel'], false);

					} else {

						self[0].onmousewheel = instance.private_methods.actions['wheel'];
						
					}

				},

				anchor: function() {

					anchor.mousedown(function(e, element) {

						e.stopPropagation();
						instance.private_methods.actions['startPos'] = anchor.offset().top - e.pageY;
						instance.private_methods.actions['init'](e, anchor);

					});

				},

				track: function() {

					track.mousedown(function(e) {

						var percent = Math.abs((self.offset().top) - e.pageY);
							percent = (percent / self.height()) * 100;

						instance.public_methods.jumpTo(percent);


					});
					
				},

				touch: function() {

					if(isTouch) {

						container[0].ontouchstart = function(e) {

							instance.private_methods.actions['startPos'] = anchor.offset().top - e.pageY;

							instance.private_methods.actions['init'](e.originalEvent, inner);

						}

					}

				}

			},

			actions : {

				yPos: null,
				startPos: null,

				init: function(e, element) {

					instance.private_methods.actions['yPos'] = self.offset().top;

					$('body').addClass('highlight-free');

					if(!isTouch) {

						$(document).mousemove(function(e) {

							e.preventDefault();
							instance.private_methods.actions['track'](e);

						});

						$(document).mouseup(function(e) {

							e.preventDefault();
							instance.private_methods.actions['unbind'](e, element);

						});						

					} else {

						self.on('touchmove', function(e) {

							e.preventDefault();
							instance.private_methods.actions['track'](e.originalEvent);

						});

						self.on('touchcancel, touchend', function(e) {

							e.preventDefault();
							instance.private_methods.actions['unbind'](e, element);

						});

					}

				},

				track: function(e) {

					var scrolled = self.offset().top - e.pageY,
						startPos = instance.private_methods.actions['startPos'],
						anchorPos = anchor.offset().top - self.offset().top;

					inner.css({

						'top' :  Math.min(0, Math.max(scollLimit, (scrolled - startPos) / visibleDecimal)) + 'px'

					});

					anchor.css({

						'top' : Math.max(paddingTop, Math.min(anchorLimit - paddingBottom, Math.abs(scrolled) + startPos)) + 'px'

					});
				},

				wheel: function(e) {

					e = e || window.event;

					e.preventDefault();

					var wheelSpeed = -(e.deltaY) || e.wheelDeltaY / 2;

					var innerPos = parseInt(inner.css('top'));
						innerPos += wheelSpeed;

					var percentScrolled = Math.round((innerPos / scollLimit) * 100);

					var anchorPos = anchorLimit * (percentScrolled / 100);

					inner.css({

						'top' :  Math.min(0, Math.max(scollLimit, innerPos)) + 'px'

					});

					anchor.css({

						'top' : Math.max(paddingTop, Math.min(anchorLimit - paddingBottom, anchorPos)) + 'px'

					});

				},

				unbind: function(e, element) {

					$(document).unbind('mousemove');

					$('body').removeClass('highlight-free');

					self.off('touchmove');

				}

			},

			resize: function() {

				var resizeTimer;

				$(window).resize(function() {

					clearTimeout(resizeTimer);

					resizeTimer = setTimeout(function() {

						instance.public_methods['update']();

					}, 100);					

				});

			},

			error: function(error) {

				console.log('['+pluginName+' '+version+'] - ' + error);

			}

		}

		instance.public_methods = {

			update: function(rebuild) {

				visibleDecimal = self.height() / inner.height();				
				hiddenDecimal = 1 - visibleDecimal;
				scollLimit = -Math.abs(inner.outerHeight() * hiddenDecimal);
				anchorLimit = Math.round(self.outerHeight() * hiddenDecimal);

				paddingTop = parseInt(track.css('padding-top'));
				paddingBottom = parseInt(track.css('padding-bottom'));

				if(rebuild == undefined) {

					track.css({

						'height' : self.css('height'),
						'display' : 'block',
						'z-index' : '10'

					});
					
					anchor.css({

						'height' : visibleDecimal * 100 + '%'

					});

				} else {

					inner.css({

						'top' : '0px'

					});

					track.css({

						'height' : self.css('height'),
						'display' : 'block',
						'z-index' : '10'

					});
					
					anchor.css({

						'height' : visibleDecimal * 100 + '%',
						'top' : paddingTop + 'px'

					});					

				}

				if(visibleDecimal == 1) {

					instance.private_methods['remove']();

				} else if(rebuild != false && self.find(inner).size() <= 0) {

					instance.private_methods['setup']();

				}

			}, 

			jumpTo: function(percent) {

				var innerPos = scollLimit * (percent / 100),
					anchorPos = anchorLimit * (percent / 100);

				inner.animate({

					'top' :  Math.min(0, Math.max(scollLimit, -Math.abs(innerPos))) + 'px'

				});

				anchor.animate({

					'top' : Math.max(paddingTop, Math.min(anchorLimit - paddingBottom, Math.abs(anchorPos))) + 'px'

				});

			}

		}

	}
	
})();