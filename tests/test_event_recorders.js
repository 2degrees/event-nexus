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
*/

define(['src/event_recorders'], function (event_recorders) {
    'use strict';

    module('Event recorders');

    // The browser console can only be tested when it is not defined by the
    // specific browser
    if (window.console) {
        test('Console event recording (console available)', function () {
            var messages = [];
            console.info = function (message) {
                messages.push(message);
            };
            
            var tracking_data = {foo: 'bar'};
            var console_recorder = new event_recorders.ConsoleEventRecorder();
            console_recorder.record(tracking_data);
            
            strictEqual(messages.length, 1);
            deepEqual(messages[0], 'foo: bar, ');
            
        });
        
    } else {
        test('Console event recording (console unavailable)', function () {
            expect(0);
            var console_recorder = new event_recorders.ConsoleEventRecorder();
            console_recorder.record({foo: 'bar'});
        });
        
    }
});