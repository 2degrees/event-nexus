# event-nexus

A declarative way to tracking and recording events on your website.

## Overview

If you need to set-up event tracking and recording on your website it can be
a never-ending task to keep lots of snippets of javascript up-to-date. With a
dynmaic site this becomes a task of ever-increasing complexity and maintainace
can become a headache.

To overcome this problem, `event-nexus` allows you to declare all the events
you want to track in a single place.

## Adding the code to your site

``event-nexus`` requires jQuery 1.7.2+ (it should work with any version of
jQuery 1.7), so include this:

``` html
<script src="/path/to/jquery/"></script>
```

Then include the event tracking library itself:

``` html
<script src="/path/to/event-nexus.js"></script>
```

At this point you have all the code to declare you events. It's recommended that
you put all the declarations for your site in a single place, e.g.

``` html
<script src="/js/my_events.js"></script>
```

## Declaring your tracking configuration

``event-nexus`` is designed to allow a declarative configuration of things to track.
Consider a case where you want to track an impression of an advert on your site and
also a click on that advert.

We would define this as follows:

``` javascript
EVENT_TRACKING_CONFIGURATION = [
    // Advert impressions
    {
        event_tracker: new event_trackers.ElementImpressionTracker(
            '.advert',
            {
                category: 'Adverts',
                action: 'Impression of advert',
                label: function ($element) {
                    return $element.data('advertiser');
                }
            }
        ),
        page_ids: ['homepage', 'contact']
    },
    // Advert click-throughs
    {
        event_tracker: new event_trackers.OutboundLinkTracker(
            '.advert>a',
            {
                category: 'Adverts',
                action: 'Click-through on advert',
                label: function ($element) {
                    return $element.parent().data('advertiser');
                }
            }
        ),
        page_ids: ['homepage', 'contact']
    }
];
```

Each directive to track an event requires two parameters:

* ``event_tracker``
* ``page_ids``

### event_tracker

This defines the objects which deals with tracking the browser event.
``event-nexus`` comes with two main types:

* user-interaction events (e.g. click event)
* element impression (i.e. page load)

In the example above, we define one of each of these. Both trackers take two
arguments:

1. The CSS selector which describes the element
2. An object containig the data to track

Since ``event-nexus`` relies on jQuery, any valid jQuery selector can be use to
describe the element and can point to multiple similar elements on the page.

The data you track can be anything. This is largely governed by the event recorder
([see below](#recording-events)) you choose to use. The values in the
object can either be strings or functions. When the function is called,
it will recieve the element as a jQuery object on which the event is taking place.

#### A note on links

Some analytics services cannot response quickly enough to the browser's request before
the location changes when the click on a link is being recorded. To work around this,
the ``OutboundLinkTracker`` is available. This adds a short delay before directing the
user on to the next page, which should give most tracking services enough time to complete
their work before the browser aborts that request.

Be careful if you have other events bound on to the click as there may be some undesirable
consequences.

### page_ids

If you have a lot of events to track on your site you want to make sure that you
don't see slow-down on all the pages due to a large configaration, you
can specify an identifier for the current page when parsing the configuarion
([see below](#recording-events)) which will be checked against the
white-list provided in the event-tracker definition.

In the example given above, only the pages identied as *homepage* and *contact* will
be considered for having the specified events tracked on.

**NB**: In debug mode ``event-nexus`` will warn you in the console if expected
elements are missing and let you know when they are found.

### Defining new event trackers

If you want to track another type of interaction, you can define
a new event tracker. The constrcutor can take anything you like,
but most likely will take some kind of tracking data.

Then you need to define a ``bind`` method. This must receive the
``tracking_data_handler``. This is a function which the event
binding system uses to link the tracker and the recorder together.
You simply need to call this function with your tracking data.

For more information, view the source!

#### Browser event handlers

If all you want to do it track a pre-defined or custom browser event 
handler, then the ``event_trackers`` module provides a factory to 
create such objects. Let's say we want to track a ``change`` event:

``` javascript
var ChangeTracker = event_trackers.build_specific_user_interaction_tracker('change');
var change_tracker = new ChangeTracker(element_selector, tracking_data);
```

## Recording events

``event-nexus`` ships with a simple console recorder which simply logs the resolved
data from the element to the browser console (if present).

To use this, set up tracking as follows:

``` javascript
var event_recorder = new event_recorders.ConsoleEventRecorder();
event_tracker_binding.bind_trackers_to_dom(
    EVENT_TRACKING_CONFIGURATION,
    event_recorder,
    $('html').data('page-id')
);
```

Now you're ready to go and you'll start to see some events appearing
in the console when you visit the *homepage* or the *contact* page.

**NB**: This example also shows how you might pass the *Page ID* into the 
tracking system. This is left up to you so that you're not tied to
any framework in particular.

### Defining new event recorders

Having your events logged to the console is all well and good, but it's
not really going to give you much useful data. For this, you'll need to
use an event recording service such as [Google analytics](http://www.google.co.uk/analytics/).

Defining a recorder to use with this service is straight-forward:

``` javascript
var GoogleAnalyticsEventRecorder = function () {};
GoogleAnalyticsEventRecorder.prototype = {
    record: function (tracking_data) {
        _gaq.push([
            '_trackEvent',
            tracking_data.category,
            tracking_data.action,
            tracking_data.label,
            tracking_data.value,
            !tracking_data.is_interactive // Google analytics requires "non-interaction"
        ]);
    }
};
```

Although ``event-nexus`` is essentially agnostic of the recording service
you might use, it was built with google analytics in mind, so you'll notice
that UserInteractionEventTracker updates the tracked data to set the ``is_interactive``
flag to ``true`` and ElementImpressionTracker does the converse.

You can override these values by simply passing them in the data to track.

## Further info

If you're stuck on how to use the system take a look at the source or the tests
as most use cases are covered there.

Failing that, [get in touch](mailto:2degrees-floss@googlegroups.com)