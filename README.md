# Pull to refresh
Pull down on mobile to enable page refresh.

## Features
* Overlay with icon and message is shown when pulling down
* When online refresh current page
* Offline enabled; works when offline and re-syncs when back online
* Message for pull and release and reload
* Cancel pull 2 refresh when move up
* Will not interfere with scroll behavior

## Limitations
* When refreshing a page the list view does not keep 'Load more' items
* Pull to refresh will only work when everything is scrolled to top

## Dependencies
Mendix version 7.3 or up

## Demo project
https://pulltorefresh.mxapps.io

![1](https://raw.githubusercontent.com/mendixlabs/pull-to-refresh/v1.1.0/assets/demo.gif)

## Usage
* Place the widget on a page or layout
* Add configurations for the different text when:
    - pulling down
    - releasing
    - refreshing
* In the client: Pull down page until the text 'release to refresh' appears in order to refresh the page

## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestions for improvement
https://github.com/mendixlabs/pull-to-refresh/issues

## Development
Prerequisite: Install git, node package manager, webpack CLI, grunt CLI

To contribute, fork and clone.

    > git clone https://github.com/mendixlabs/pull-to-refresh.git

The code is in typescript. Use a typescript IDE of your choice, like Visual Studio Code or WebStorm.

To set up the development environment, run:

    > npm install

Create a folder named `dist` in the project root.

Create a Mendix test project in the dist folder and rename its root folder to `dist/MxTestProject`. Or get the test project from https://github.com/mendixlabs/pull-to-refresh/releases/download/1.0.1/TestPullToRefresh.mpk Changes to the widget code shall be automatically pushed to this test project.

To automatically compile, bundle and push code changes to the running test project, run:

    > grunt
