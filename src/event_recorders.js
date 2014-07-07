/**
* Copyright (c) 2012-2014, 2degrees Limited <2degrees-floss@googlegroups.com>.
* All Rights Reserved.
*
* This file is part of event-nexus
* <https://github.com/2degrees/event-nexus>, which is subject to
* the provisions of the BSD at
* <http://dev.2degreesnetwork.com/p/2degrees-license.html>. A copy of the
* license should accompany this distribution. THIS SOFTWARE IS PROVIDED "AS IS"
* AND ANY AND ALL EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED, INCLUDING, BUT
* NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST
* INFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE.
*
* Dependencies:
* - jQuery 1.7.2+
* - require.js (or other AMD loader)
*
*/

define(['jquery'], function ($) {

    'use strict';

    var ConsoleEventRecorder = function () {};
    ConsoleEventRecorder.prototype.record = (function () {
        var recording_function;

        if (window.console) {
            recording_function = function (tracking_data) {
                var message = '';
                $.each(tracking_data, function(key, value) {
                    message += key + ': ' + value + ', ';
                });
                console.info(message);
            };
        } else {
            recording_function = $.noop;
        }
        return recording_function;
    })();

    // Public API

    var module = {
        ConsoleEventRecorder: ConsoleEventRecorder
    };
    return module;
});
