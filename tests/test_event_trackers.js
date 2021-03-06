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

define(['src/event_trackers'], function (event_trackers) {
    'use strict';

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
});
