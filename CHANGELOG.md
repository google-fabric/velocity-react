### v1.4.3 (2019-05-09):

Adds `timeout` prop to `Transition` in test to avoid a PropTypes warning.

### v1.4.2 (2018-11-14):

Uses a `<Transition>` element in test/server mode to keep react-dom from warning
about TransitionGroup’s props placed on HTML children.

### v1.4.1 (2018-04-17):

Fixes false children bug #240. (Thanks for the report, @tiffanytangt!)

### v1.4.0 (2018-04-12):

Dependency upgrades! No new features.

 - Changes our `componentWillUpdate` call to `componentDidUpdate` to eliminate a
   React 16.3 StrictMode warning
 - Migration to [react-transition-group](https://github.com/reactjs/react-transition-group) v2
 - Switches from lodash 3 to lodash 4
 - Changes demo to use React 16.3

There still are StrictMode warnings due to `react-transition-group` still using
the older APIs.

### v1.3.3 (2017-05-19):

Fixes incorrect timer clearing. (Thanks, @dmeiz1)

### v1.3.2 (2017-05-11):

Fix for calling clearTimeout in IE 8. (Thanks, @prchaoz!)

Additional updates to peerDependencies around the new React 15.5-compatible
libraries. (Thanks, @MichaelDeBoey!)

### v1.3.1 (2017-05-09):

Fixes React peer dependencies to specify versions that work with
`prop-types`. (Thanks, @MichaelDeBoey!)

### v1.3.0 (2017-05-08):

Removes warnings from React 15.5 for React 16.0 compatibility.

Converts to ES2015 classes, adds compilation on distribution.

Minor version bump due to changes around removal of isMounted checks, so there
may be some regressions.

### v1.2.2 (2017-04-19):

Adds `interruptBehavior` prop to `VelocityComponent`. (Thanks, @Robinfr!)

Changes to remove warnings in React 15.5 will come shortly in v1.3.

### v1.2.1 (2017-01-19):

This is a minor version bump that updates the version of babel to the latest (v6).

### v1.2.0 (2017-01-12):

This is a minor version bump due to the `velocity-animate` dependency getting a minor version
bump to 1.4 that may contain timing changes. See `velocity-animate` changes here:

https://github.com/julianshapiro/velocity/compare/1.3.0...1.4.0

Thanks to @matthewjf for helping track this down as an issue with how Velocity before 1.4
fired `complete` callbacks on multiple elements animating.

#### Bug fixes:
 * Check for presence of `navigator` before using it to determine if we’re running
   in a browser. (Thanks, @alampros!)
 * Fix undefined `forEach` method call when doing recursive cache-cleaning without
   jQuery. (Thanks, @kennygwang!)

### v1.1.11 (2016-10-20):

Bump `velocity-animate` to v1.3.1 once more now that it's published to npm!

### v1.1.10 (2016-10-17):

Reverts `velocity-animate` bump to v1.3.1, it's apparently not published to npm yet :(

### v1.1.9 (2016-10-17):

Bump `velocity-animate` to v1.3.1 (fixes https://github.com/julianshapiro/velocity/issues/305)

### v1.1.8 (2016-10-07):

#### Bug fixes
 * Fix for jsdom check in IE (Thanks, @stephenleicht!)

### v1.1.7 (2016-10-03):

#### Bug fixes
 * Fix for removeData in shim mode (Issue #127)

### v1.1.6 (2016-09-28):

#### Bug fixes
 * Prevent Velocity memory leaks when not using jQuery (Thanks, @eirikurn!)
 * Compatibility with SystemJS's "require" parsing (Thanks, @luisherranz!)
 * Enable Velocity shim even when JSDom is present by testing process.env (Thanks, @Tomyail!)

### v1.1.5 (2016-04-11):

Updates to allow React 15. (Thanks, @StevenLangbroek!)

#### Bug fixes
 * Passes context into VelocityTransitionGroup animations' “complete” callbacks
   so that they know what elements finished animating.


### v1.1.4 (2016-03-09):

#### Bug fixes
 * Keeps leave’s "begin" callback from firing on enter. (Thanks, @SethTompkins!)


### v1.1.3 (2016-02-16):

#### Bug fixes
 * Fixes “Invalid calling object” in rAF shim for IE. (Thanks, @restlessbit!)


### v1.1.2 (2016-02-08):

#### Bug fixes
 * `complete` callbacks for `VelocityTransitionGroup` now fire correctly.
 * `velocityHelpers`’s `registerEffect` can be called (as a no-op) on the server.
 * Fallback to `setTimeout` if `requestAnimationFrame` is not defined.

#### Features
 * `VelocityTransitionGroup` can take `enterHideStyle` and `enterShowStyle` props
   to customize how entering elements are kept from being shown before their
   animations start.


### v1.1.1 (2015-10-21):

#### Bug fixes
 * Fix for `VelocityTransitionGroup` not animating when no `leave` prop is set.
 * Better detection of existing `Velocity` instances (thanks, @arush!).

### v1.1.0 (2015-10-08):

Updated peerDependencies and requires to React 0.14.

If you need to work with React 0.13, use v1.0.1.

Special thanks to @jmfurlott for help updating everything that needed updating.

### v1.0.1 (2015-10-05):

#### Bug fixes
 * Shims out Velocity when running on the server so that the components all no-op

### v1.0.0 (2015-09-29):

Initial release! Contains `VelocityComponent` and `VelocityTransitionGroup`.

Read the [blog post](https://fabric.io/blog/introducing-the-velocityreact-library) and
enjoy the demos.
