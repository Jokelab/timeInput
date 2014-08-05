/*
jQuery timeInput plugin

Description: allow input fields to contain a time value in hours and minutes. 
It's purpose is not to select a moment in time, but an amount of time e.g. 120 hours and 10 minutes.

Version: 0.1
Author: Robert Beisicht
Date: July 23, 2014
*/
(function ($) {
    $.fn.timeInput = function (options) {

        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the default settings.
            maxMinutes: 24 * 60,
            minMinutes: 0,
            defaultMinutes: null,
            decimalSeparator: ",",
            hourMinuteSeparator: ":",
            roundToNearest: 15
        }, options);
        var timeRegEx = new RegExp(/^[0-9]{1,}:[0-5][0-9]$/);

        //immediately set the value to the default number of minutes
        if (settings.defaultMinutes !== null) {
            $(this).val($.fn.timeInput.minutesToString(settings.defaultMinutes, settings.hourMinuteSeparator));
        }

        /* attach event handlers*/
        this.on("keypress", handleKeyPress);
        this.on("change", handleChange);

        /* private functions */

        /*handle input change event*/
        function handleChange() {
            var value = $(this).val();
            if (value.length === 0) return true;

            //check if the time value is valid or not by testing it against the regular expression
            if (!timeRegEx.test(value)) {

                var minutes = 0;
                if (value.indexOf(settings.hourMinuteSeparator) > -1 || value.indexOf(settings.decimalSeparator) > -1) {
                    //the value has a semicolon or comma but doesn't match the pattern
                    minutes = ensureBounds($.fn.timeInput.stringToMinutes(value, settings.hourMinuteSeparator, settings.decimalSeparator));
                   minutes = roundToNearest(minutes);
                }
                else {
                    //the value doesn't match the pattern, but because only numbers are allowed AND it does not contain a semicolon or comma, 
                    //so the input must be a simple integer value
                    minutes = ensureBounds(parseInt(value * 60));
                    minutes = roundToNearest(minutes);
                }
                $(this).val($.fn.timeInput.minutesToString(minutes, settings.hourMinuteSeparator));
                return true;
            }
            //time is ok, only check boundaries
            var minutes = ensureBounds($.fn.timeInput.stringToMinutes(value, settings.hourMinuteSeparator, settings.decimalSeparator));
            minutes = roundToNearest(minutes);
            $(this).val($.fn.timeInput.minutesToString(minutes, settings.hourMinuteSeparator));
            return true;
        }


        /* handle keypress event */
        function handleKeyPress(e) {
            //allow backspace and tab
            if (e.which == 0 || e.which == 8) {
                return true;
            }

            var chr = String.fromCharCode(e.which);
         
            var separatorEntered = chr === settings.hourMinuteSeparator || chr == settings.decimalSeparator;

            //allow only numbers semicolons and comma's
            if (("1234567890" + settings.hourMinuteSeparator + settings.decimalSeparator).indexOf(chr) < 0) {
                return false;
            }

            //only allow one separator
            if (($(this).val().indexOf(settings.hourMinuteSeparator) > -1 || $(this).val().indexOf(settings.decimalSeparator) > -1)
                && separatorEntered)
            {
                return false;
            }

           

        }

        //make sure the value is always between min and max
        function ensureBounds(minutes) {
            return Math.min(Math.max(minutes, settings.minMinutes), settings.maxMinutes);
        }

        /* round minutes to quarter (15), half hour (30) or whole hour  (60).
         * The settings specify which value to use. Any other value will be ignored.
         */
        function roundToNearest(minutes) {
            var roundTo = settings.roundToNearest;
            var output = minutes;
            if (roundTo == 15 || roundTo == 30 || roundTo==60) {
                output = Math.round(minutes / roundTo) * roundTo;
            }
    
            return output;
        }



        /* public functions */

        /*
		Calculate the total number of minutes. So a time of "5:45" returns 5 * 60 + 45
		*/
        this.getTotalMinutes = function () {
            return $.fn.timeInput.stringToMinutes(this.val(), settings.hourMinuteSeparator, settings.decimalSeparator);
        }

        /*
		Calculate the total number of hours as a floating point number.  So a time of "5:45" returns 5.75
		*/
        this.getTotalHours = function () {
            var minutes = this.getTotalMinutes();
            return minutes / 60;
        }

        //don't break the jQuery chain
        return this;

    };

    //public static methods
    $.fn.timeInput.minutesToString = function (minutes, hourMinuteSeparator) {
        var minutes = minutes < 0 ? 0 : Math.round(minutes);
        var hours = Math.floor(minutes / 60).toString();
        var minutes = (minutes % 60).toString();
        var separator = typeof hourMinuteSeparator == 'undefined' ? ":" : hourMinuteSeparator;

        //pad minutes with zero's if necessary
        if (minutes.length <= 1) {
            minutes = "0" + minutes;
        }
        return hours + separator + minutes;
    };

    //convert a valid timestring to the number of minutes
    $.fn.timeInput.stringToMinutes = function (input, hourMinuteSeparator, decimalSeparator) {

        if (input.length == 0) {
            return 0;
        }
        var semicolon = typeof hourMinuteSeparator == 'undefined' ? ":" : hourMinuteSeparator;
        var comma = typeof decimalSeparator == 'undefined' ? "," : decimalSeparator;
        //if it contains separators, split the string in hours and minutes
        var semicolonIndex = input.indexOf(semicolon);
        var commaIndex = input.indexOf(comma);
        if (semicolonIndex >= 0) {
            var hours = semicolonIndex > 0 ? parseInt(input.substring(0, semicolonIndex)) : 0;
            var minutes = input.substring(semicolonIndex + semicolon.length);
            minutes = minutes.length > 2 ? minutes.substring(0, 2) : minutes;
            minutes = minutes.length === 0 ? 0 : parseInt(minutes);
            return parseInt((hours * 60) + minutes);
        }
        if (commaIndex >= 0) {
            var hours = commaIndex > 0 ? parseInt(input.substring(0, commaIndex)) : 0;
            var minutes = input.substring(commaIndex + comma.length);
            //allow max 2 numbers after the decimal separator
            minutes = minutes.length > 2 ? minutes.substring(0, 2) : minutes;
            minutes = minutes.length === 0 ? 0 : parseInt(minutes);

            //if single number after comma
            if (minutes < 10) {
                minutes = minutes * 6;
            }
            else {
                //two numbers after comma e.g. 3,75 hours
                minutes = minutes * 0.6;
            }

            return parseInt((hours * 60) + minutes);
        }

        //else the input must be in numeric hours, so simply multiply by 60
        return parseInt(input) * 60;

    }

}(jQuery));
