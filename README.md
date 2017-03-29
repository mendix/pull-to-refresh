# Pull to refresh
Use touch on mobile enabling pull down to reload a page.

## Features
* Overlay with icon and message is shown when pulling down
* When online refresh current page
* Offline enabled, when offline, it re-syncs
* Message for pull and release and reload
* Cancel pull 2 refresh when move up.
* Will no interfere with scroll behavior

## limitation
* When refreshing a page the list view does not keep 'Load more' items
* Pull to refresh will only work when when everything is scrolled to top

## Dependencies
Mendix 6.10

## Demo project
https://pulltorefresh.mxapps.io

## Usage
* Place the widget on page or layout
* Add configurations for the different text when pulling down, when to release and when refreshing
* In the client: Pull down page until the text 'release to refresh' appears in order to refresh the page

## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestion for improvement
https://github.com/mendixlabs/pull-to-refresh/issues

## Disclaimer
Status: In development

Pull 2 refresh. No guarantees are given that this works or keeps working.
