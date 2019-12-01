/*jslint browser:true, devel:true*/

//This 'flag' variable controls if we output debugging info to the console or not
var DEBUG = true;
/* global console:false, Modernizr:false, DEBUG:false, $:false */

//Setup variables for using the intlTelInput plugin:
//Since version 14, intlTelInput removed the jQuery dependency, so select the
//HTML Element with the id of "phone" withOUT using jQuery
var telInput = document.querySelector("#phone");
//jQuery WILL be used to hide and show the error message and valid message HTML
//Elements, so select them both using jQuery
var errorMsg = $("#error-msg");
var validMsg = $("#valid-msg");
//The following errorMap array maps to the error code returned from
//getValidationError - see the intlTelInput plugin readme
var errorMap = [ "Invalid number", "Invalid country code", "Too short",
	"Too long", "Invalid number" ];

//initializing intlTelInput plugin to use the utilsScript to load Google's libphonenumber utility
var iti = window.intlTelInput(telInput, {
    utilsScript: "js/vendor/intl-tel-input-master/build/js/utils.js"	
});

//Resets error message to empty string;
//hides error and valid messages
var reset = function() {
    errorMsg.html("");
    errorMsg.hide();
    validMsg.hide();
};

//on blur: validates telInput
//if valid: shows validMsg
//if there is an error: shows errorMsg
telInput.addEventListener('blur', function() {
    reset();
    if (telInput.value.trim()) {
        if (iti.isValidNumber()) {
            validMsg.show();
        } else {
            var errorCode = iti.getValidationError();
            errorMsg.html(errorMap[errorCode]);
            errorMsg.show();
        }
    }
});

//on keyup / change flag: reset
telInput.addEventListener('change', reset);
telInput.addEventListener('keyup', reset);

//The purpose of processFormData is to do final validation checks,
//and to stop the form from submitting,
//but you can also use it to help with debugging
var processFormData = function(event) {
	"use strict";
	// prevent the default behavior of the form submit event
	event.preventDefault();
	if (DEBUG) {
		console.log(event);
		console.log(this);
		var form = document.forms.post_plant;
		console.log(form);
	}

	var $form = $("#post_plant");
	var submitOnlyIfValid = function(form) {
		// Check if the form is valid
		if ($form.valid()) {
			$("div.error").hide();
		} else {
			// not valid
			$("div.error").show("slow");
			var errmsg = "form was considered NOT valid and form submittion is cancelled";
			if (DEBUG) {
				console.log(errmsg);
			}
			alert(errmsg);
			return false;
		}
		// Also check with the non-jQuery intlTelInput validation
		if (telInput && iti) {
			// intlTelInput exists so see if it is valid
			if (telInput.value.trim()) {
				if (!iti.isValidNumber()) {
					// Don't submit the form since intlTelInput is
					// not valid
					$("div.error span").html("Phone number is not valid");
					$("div.error").show("slow");
					var errmsg = "intlTelInput was considered NOT valid and form submittion is cancelled";
					if (DEBUG) {
						console.log(errmsg);
					}
					alert(errmsg);
					return false;
				}
			}
		}
		if (DEBUG) {
			console
			.log("Form was considered valid and normally would have been submitted");
		}
		alert("Form was considered valid and normally would have been submitted.");
		return true;
	};

	// Validate the form
	$form
	.validate({
		rules : {
			// planting date has been set by the user in dateISO format.
			// Input will be in 24 hour format but the display in modern
			// browsers will be use AM/PM formatting.
			// See: http://jqueryvalidation.org/dateISO-method/
             field: {
                 required: true,
                 dateISO: true
		},
		invalidHandler : function(event, validator) {
			// Inside this function 'this' refers to the form
			var errors = validator.numberOfInvalids();
			if (errors) {
				var message = errors === 1 ? 'You missed 1 field. It has been highlighted'
						: 'You missed ' + errors + ' fields. They have been highlighted';
				$("div.error span").html(message);
				$("div.error").show("slow");
			} else {
				$("div.error").hide();
			}
		},
		submitHandler : submitOnlyIfValid
        }
    });

	// If the form is valid hide div.error
	if ($form.valid()) {
		$("div.error").hide();
	}

	// returning false also stops the form from submitting
	return submitOnlyIfValid($form);
};

//If the browser supports the date input type, don't do anything
//This code is cribbed from
//http://code.tutsplus.com/tutorials/quick-tip-cross-browser-datepickers-within-minutes--net-20236
var initDatePicker = function() {
	"use strict";
	// Modernizr (https://modernizr.com/) gives you the ability to detect
	// whether the browser supports native datepickers.
	if (DEBUG) {
		console.log("Modernizr.inputtypes.date:", Modernizr.inputtypes.date);
	}
	if (!Modernizr.inputtypes.date) {
		// For the browser that doesn't support native datepickers: jQuery UI Date Picker
		// with date format 'yy-mm-dd' which will make the date have a 4 digit year (confusingly for jQuery UI y means a 2 digit year and yy means a 4 digit year),
		// and 2 digit months and days.
		// Test using the current FirefoxDeveloperEdition browser
		// AND the old Firefox 55.0.3 browser.
        $( "#planting_date" ).datepicker({
            'format': 'yy-mm-dd', //'m/d/yyyy' or 'yy-mm-dd'
            'autoclose': true
        });
        
	}
};
//Initialize the jQuery UI plugin's DatePicker plugin for the planting time
initDatePicker();

//Initializing the default timepicker plugin for the planting time
$("#planting_time").timepicker();
