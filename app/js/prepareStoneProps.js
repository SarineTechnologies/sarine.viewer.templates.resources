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

		function formatProperty(format, value) {
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
                var formatted = sprintf(format, value);
                if (formatted === format) {
                    console.error('format not valid');
                    return value;
                }
                return formatted;
            }
        }

        function formatDynamicProperty(configFormat, stoneProperties) {

            if (configFormat.indexOf('{') === -1)
                configFormat = "{"+configFormat+"}";
            
            var pattern = /\{([^}]+)\}+/gi,
                matches = null,
                parsed = {},
                el = '',
                elProp = [],
                elFormat = '',
                elPropName = '',
                output = null,
                value;
                
            matches = configFormat.toString().match(pattern);
            if ( ! matches) {
                throw new Error("Format error. Format string should be surrounded with {} and contain some dimension. Example: '{width|%.2s}'.");
            }
            
            matches.every(function (placeholder) {                
                el = placeholder.replace("{", "").replace("}", "");                
                elProp = el.split("|");                    
                elPropName = elProp[0];
                elFormat = elProp[1];                    

                parsed[elPropName] = {
                    placeholder: placeholder
                };
                
                value = stoneProperties[elPropName];

                if(!value)
                    return false;
               
                parsed[elPropName].formatted = elFormat? formatProperty(elFormat, value) : value;
                return true;   
            });

            // replace placeholders with formatted values ({W|%.2s} -> 2.99)
            output = configFormat;
            for (var i in parsed) {
                if(!parsed[i].formatted)
                    return null;
                output = output.replace(parsed[i].placeholder, parsed[i].formatted);                
            }

            return output;
        }

        window.formatProp = {
	        formatDynamicProperty: formatDynamicProperty,
	        formatProperty: formatProperty
    	};
})(window, window.document, window.jQuery, window.tplUtils);
