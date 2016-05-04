(function (window, document, $, tplUtils) {
		'use strict';

		window.prepareStoneProperties = function () {
			var transferFields = [
					'clarity',
					'color',
					'cutGrade', 
					'carat',
					'shape'
			],
			stone = window.stones && window.stones[0],
			devLog = tplUtils.devLog;
			devLog('Starting prepareStoneProperties');
			
			if (!stone.labs) return;
			if (!stone.labs[0]) return;
			if (stone.labs[0].name !== 'GSI') return; 

			devLog('Taking stone properties from "labs" section');


			transferFields.forEach(function (aField) {
				if (window.stones[0].labs[0][aField]) {
					window.stones[0].stoneProperties[aField] = window.stones[0].labs[0][aField];
				}
			});
		};
})(window, window.document, window.jQuery, window.tplUtils);
