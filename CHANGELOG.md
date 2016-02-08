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
