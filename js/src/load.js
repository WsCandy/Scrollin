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

			console.log('load');

		}

	}

	$(window).load(function() {

		load.init();

	});

})();