;(function() {

	'use strict';

	window.load = {

		init: function() {

			for(var funcs in load) {

				if(funcs == 'init') continue;

				load[funcs]();

			}

		},

		load: function() {

			$('.scrollin').scrollin();

		}

	}

	$(window).load(function() {

		load.init();

	});

})();