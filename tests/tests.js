/**
* Copyright (c) 2012, 2degrees Limited <2degrees-floss@googlegroups.com>.
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


module('Event trackers');

test('Resolution of tracking data with callback', function () {
    var mock_element = 'Hi there!';
    
    var get_data = function (element) {
        return 'Mock data: ' + element;
    };
    
    var resolved_tracking_data = event_trackers.resolve_tracking_data(
        {datum: get_data},
        mock_element
    );
    
    deepEqual(resolved_tracking_data, {datum: get_data(mock_element)});
});

test('Tracking data without callback', function () {
    var value = 'Hi there!';
    
    var resolved_tracking_data = event_trackers.resolve_tracking_data(
        {datum: value},
        null
    );
    
    deepEqual(resolved_tracking_data, {datum: value});
});

test('User interaction tracker construction', function () {
    var element_selector = '#block a';
    var event_name = 'click';
    var tracking_data = null;
    
    var event_tracker = new event_trackers.UserInteractionTracker(
        element_selector,
        event_name,
        tracking_data
    );
    
    strictEqual(event_tracker.element_selector, element_selector);
    strictEqual(event_tracker.event_name, event_name);
    
    var expected_tracking_data = $.extend(
        {is_interactive: true},
        tracking_data
    );
    deepEqual(event_tracker.tracking_data, expected_tracking_data);
});

test('Specific user interaction tracker construction', function () {
    var element_selector = '#block a';
    var tracking_data = null;
    
    var ChangeTracker = event_trackers.build_specific_user_interaction_tracker(
        'change'
    );
    
    var change_tracker = new ChangeTracker(element_selector, tracking_data);
    
    strictEqual(change_tracker.element_selector, element_selector);
    strictEqual(change_tracker.event_name, 'change');
});

test('User interaction tracker binding', function () {
    var $fixture = $('#qunit-fixture');
    $fixture.append('<a href="#">hello!</a>');
    
    var element_selector = '#qunit-fixture a';
    var event_name = 'click';
    var tracking_data = {
        foo: 'bar',
        bar: function (element) { return 'foo'; }
    };
    
    var event_tracker = new event_trackers.UserInteractionTracker(
        element_selector,
        event_name,
        tracking_data
    );
    
    var actual_tracked_data = null;
    event_tracker.bind(function (tracking_data) {
        actual_tracked_data = tracking_data;
    });
    
    $(element_selector).trigger(event_name);
    
    var expected_tracked_data = {foo: 'bar', bar: 'foo', is_interactive: true};
    deepEqual(actual_tracked_data, expected_tracked_data);
});

test('Element impression tracker construction', function () {
    var element_selector = '#block a';
    var tracking_data = null;
    
    var event_tracker = new event_trackers.ElementImpressionTracker(
        element_selector,
        tracking_data
    );
    
    strictEqual(event_tracker.element_selector, element_selector);
    
    var expected_tracking_data = $.extend(
        {is_interactive: false},
        tracking_data
    );
    deepEqual(event_tracker.tracking_data, expected_tracking_data);
});

test('Element impression tracker binding', function () {
    var $fixture = $('#qunit-fixture');
    $fixture.append('<a href="#">hello!</a><a href="#">bye!</a>');
    
    var element_selector = '#qunit-fixture a';
    var tracking_data = {
        foo: 'bar',
        text: function ($element) { return $element.text(); }
    };
    
    var event_tracker = new event_trackers.ElementImpressionTracker(
        element_selector,
        tracking_data
    );
    
    var tracked_data = [];
    event_tracker.bind(function (tracking_data) {
        tracked_data.push(tracking_data);
    });
    
    var expected_tracked_data = [
        {foo: 'bar', text: 'hello!', is_interactive: false},
        {foo: 'bar', text: 'bye!', is_interactive: false}
    ];
    deepEqual(tracked_data, expected_tracked_data);
});


module('Event recorders');

// The browser console can only be tested when it is not defined by the
// specific browser
if (window.console) {
    test('Console event recording (console available)', function () {
        var messages = [];
        console.log = function (message) {
            messages.push(message);
        };
        
        var tracking_data = {foo: 'bar'};
        var console_recorder = new event_recorders.ConsoleEventRecorder();
        console_recorder.record(tracking_data);
        
        strictEqual(messages.length, 1);
        deepEqual(messages[0], tracking_data);
        
    });
    
} else {
    test('Console event recording (console unavailable)', function () {
        expect(0);
        var console_recorder = new event_recorders.ConsoleEventRecorder();
        console_recorder.record({foo: 'bar'});
    });
    
}


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
    window.console.debug = function (message) {
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
