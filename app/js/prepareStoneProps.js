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

		function formatConfig(format, value) {
            var precision = 0;
            
            if (format.match(/\%.[0-9]s/gi)) {
                // found string then truncate number

                // get precision number from format string
                precision = parseInt(format.replace(/[^0-9]+/gi, ""));
                var reg = new RegExp("^-?\\d+(?:\\.\\d{0," + precision + "})?");
                
                return parseFloat(reg.exec(value)[0]).toFixed(precision);
            }
            else {
                // standard expression for sprintf() function
                return sprintf(format, value);
            }
        }

		function formatDimensions(configFormat, dimensions) {
            var pattern = /\{([^}]+)\}+/gi,
                matches = null,
                parsed = {},
                el = '',
                elProp = [],
                elFormat = '',
                elDimension = '',
                output = null;
                
            matches = configFormat.match(pattern);
            if ( ! matches) {
                throw new Error("Format error. Format string should be surrounded with {} and contain some dimension. "
                    + "Example: \"{W|%.2s}mm X {H|%s}mm X {D|%.2f}mm\" or \"{W|%.2s}\".");
            }
            
            matches.forEach(function (placeholder) {
                // remove {} symbols
                el = placeholder.replace("{", "").replace("}", "");
                
                // get dimension (W, H, D, etc.) and format value (%.2s, %.2f etc.)
                elProp = el.split("|");                    
                elDimension = elProp[0];
                elFormat = elProp[1];                    

                parsed[elDimension] = {
                    placeholder: placeholder
                };
                
                parsed[elDimension].formatted = formatConfig(elFormat, dimensions[elDimension]);
                
            });

            // replace placeholders with formatted values ({W|%.2s} -> 2.99)
            output = configFormat;
            for (var i in parsed) {
                output = output.replace(parsed[i].placeholder, parsed[i].formatted);                
            }

            return output;
        }

        window.formatProp = {
	        formatDimensions: formatDimensions,
	        formatConfig: formatConfig
    	};
})(window, window.document, window.jQuery, window.tplUtils);
