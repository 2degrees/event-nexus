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

define(
    ['src/event_trackers', 'src/event_tracker_binding'],
    function (event_trackers, event_tracker_binding) {
    'use strict';

    module('Event tracker binding');

    test('Bind the event definition with matching page_id with element present', function () {
        var $fixture = $('#qunit-fixture');
        $fixture.append('<div>Test</div>');
        
        var tracked_data = [];
        var mock_recorder = {
            record: function (tracking_data) {
                tracked_data.push(tracking_data);
            }
        };
        
        var data_to_track = {foo: 'bar'};
        
        var event_tracker = new event_trackers.ElementImpressionTracker(
            '#qunit-fixture div',
            data_to_track
        );
        var trackers_definition = [
            {
                event_tracker: event_tracker,
                page_ids: ['homepage', 'about_us']
            }
        ];
        
        if (!window.console) {
            window.console = {};
        }
        
        var debug_messages = [];
        window.console.log = function (message) {
            debug_messages.push(message);
        };
        
        event_tracker_binding.bind_trackers_to_dom(
            trackers_definition,
            mock_recorder,
            'homepage',
            true
        );
        
        strictEqual(tracked_data.length, 1);
        deepEqual(tracked_data[0], event_tracker.tracking_data);
        
        strictEqual(debug_messages.length, 1);
        deepEqual(debug_messages[0], 'Tracked element "#qunit-fixture div" found');
    });

    test('Bind the event definition with matching page_id with element absent', function () {
        var $fixture = $('#qunit-fixture');
        $fixture.append('<div>Test</div>');
        
        var tracked_data = [];
        var mock_recorder = {
            record: function (tracking_data) {
                tracked_data.push(tracking_data);
            }
        };
        
        var data_to_track = {foo: 'bar'};
        
        var event_tracker = new event_trackers.ElementImpressionTracker(
            '#qunit-fixture span',
            data_to_track
        );
        var trackers_definition = [
            {
                event_tracker: event_tracker,
                page_ids: ['homepage', 'about_us']
            }
        ];
        
        if (!window.console) {
            window.console = {};
        }
        
        var warning_messages = [];
        window.console.warn = function (message) {
            warning_messages.push(message);
        };
        
        event_tracker_binding.bind_trackers_to_dom(
            trackers_definition,
            mock_recorder,
            'homepage',
            true
        );
        
        strictEqual(tracked_data.length, 0);
        
        strictEqual(warning_messages.length, 1);
        deepEqual(
            warning_messages[0],
            'Tracked element "#qunit-fixture span" not found'
        );
    });


    test('Bind the event definition with page_id not set', function () {
        var $fixture = $('#qunit-fixture');
        $fixture.append('<div>Test</div>');
        
        var tracked_data = [];
        var mock_recorder = {
            record: function (tracking_data) {
                tracked_data.push(tracking_data);
            }
        };
        
        var data_to_track = {foo: 'bar'};
        
        var event_tracker = new event_trackers.ElementImpressionTracker(
            '#qunit-fixture div',
            data_to_track
        );
        var trackers_definition = [
            {
                event_tracker: event_tracker
            }
        ];
        
        if (!window.console) {
            window.console = {};
        }
        
        var debug_messages = [];
        window.console.log = function (message) {
            debug_messages.push(message);
        };
        
        event_tracker_binding.bind_trackers_to_dom(
            trackers_definition,
            mock_recorder,
            'homepage',
            true
        );
        
        strictEqual(tracked_data.length, 1);
        deepEqual(tracked_data[0], event_tracker.tracking_data);
        
        strictEqual(debug_messages.length, 1);
        deepEqual(debug_messages[0], 'Tracked element "#qunit-fixture div" found');
    });


    test('Bind the event definition with no matching page_id', function () {
        var $fixture = $('#qunit-fixture');
        $fixture.append('<div>Test</div>');
        
        var tracked_data = [];
        var mock_recorder = {
            record: function (tracking_data) {
                tracked_data.push(tracking_data);
            }
        };
        
        var data_to_track = {foo: 'bar'};
        
        var event_tracker = new event_trackers.ElementImpressionTracker(
            '#qunit-fixture div',
            data_to_track
        );
        var trackers_definition = [
            {
                event_tracker: event_tracker,
                page_ids: ['about_us']
            }
        ];
        
        event_tracker_binding.bind_trackers_to_dom(
            trackers_definition,
            mock_recorder,
            'homepage'
        );
        
        strictEqual(tracked_data.length, 0);
    });

});