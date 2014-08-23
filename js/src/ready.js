;(function() {

	'use strict';

	window.ready = {

		init: function() {

			for(var funcs in ready) {

				if(funcs == 'init') continue;

				ready[funcs]();

			}

		},

		ready: function() {

			

		}

	}

	$(function() {

		ready.init();

	});

})();