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
