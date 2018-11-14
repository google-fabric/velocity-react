# velocity-react

[React](http://facebook.github.io/react/) components for interacting with the
[Velocity](http://velocityjs.org/) DOM animation library.

Read our [announcement blog post](https://fabric.io/blog/introducing-the-velocityreact-library) for
details about why and how we built this.

See the [live demo](http://google-fabric.github.io/velocity-react/).

**Latest version:** v1.4.2 Avoids react-dom warnings in test for `Transition` props.

*Note: v1.1.0 and later require React 0.14.x*
*Note: v1.3.0 and later require React 15.3.x and should work with React 16*

## Running the demo

```
$ git clone https://github.com/twitter-fabric/velocity-react.git
$ cd velocity-react
$ npm install
$ npm run demo
```

Visit <http://localhost:8080/webpack-dev-server/> in your browser. Hot reloading is enabled, if you
want to tweak the code in main.jsx.

## Installation

The velocity-react library is provided as an [NPM package](https://www.npmjs.com/package/velocity-react):

```
$ npm install --save velocity-react
```

The `VelocityComponent` and `VelocityTransitionGroup` components, as well as the `velocityHelpers`
utilities, are distributed as ES5-compatible JavaScript files with [CommonJS](http://www.commonjs.org/)
`require` statements. You will need a dependency tool such as [Browserify](http://browserify.org/),
[RequireJS](http://requirejs.org/), or [webpack](https://webpack.github.io/) to use them on the web.

This package depends directly on Velocity, as well as [lodash](https://lodash.com/) for a handful
of utility functions (which are required individually to try and keep bundle size down).

To use the Velocity UI Pack, which includes a library of transitions and support for the `stagger`,
`drag`, and `backwards` options, require it along with Velocity at an entry point to your app:
```JS
  require('velocity-animate');
  require('velocity-animate/velocity.ui');
```

**Note**: Depending upon where your version of NPM places dependencies, you may need to explicitly
require `velocity-animate` in your package.json to be able to require `velocity-animate/velocity.ui`.

It is assumed that your application already depends on `react` and `react-dom` at v15. If you're
still at React 0.13, use v1.0.1 of this package. Other than dependencies, it is the same as v1.1.0.

## Usage

### `VelocityComponent`

Component to add Velocity animations to a child node or one or more of its descendants. Wraps a single
child without adding additional DOM nodes.

#### Example
```JSX
  <VelocityComponent animation={{ opacity: this.state.showSubComponent ? 1 : 0 }} duration={500}>
    <MySubComponent/>
  </VelocityComponent>
```

#### Details

The API attempts to be as declarative as possible. A single `animation` property declares what
animation the child should have. If that property changes, this component applies the new animation
to the child on the next tick.

By default, the animation is not run when the component is mounted. Instead, Velocity's `finish`
command is used to jump to the animation's end state. For a component that animates out of and
back in to a default state, this allows the parent to specify the "animate into" animation as
the default, and therefore not have to distinguish between the initial state and the state to
return to after animating away.

#### Properties

`animation`: Either an animation key or hash defining the animation. See Velocity's documentation
  for what this can be. (It is passed to Velocity exactly.)

`runOnMount`: If true, runs the animation even when the component is first mounted.

`targetQuerySelector`: By default, this component's single child is animated. If `targetQuerySelector`
  is provided, it is used to select descendants to apply the animation to. Use with caution, only
  when you're confident that React's reconciliation will preserve these nodes during animation.
  Also note `querySelectorAll`'s [silly behavior](http://ejohn.org/blog/thoughts-on-queryselectorall/) w.r.t. pruning results when being called on a node.
  A special value of "children" will use the direct children of the node, since there isn't a
  great way to specify that to `querySelectorAll`.

`interruptBehavior`: Specifies what should happen to an in-progress animation if the `animation`
  property changes. By default is `stop`, which stops it at its current position, letting the new
  animation use that as a starting point. This generally gives the smoothest results. Other options
  are `finish`, which jumps the animation to its end state, and `queue`, which will proceed with
  the new animation only after the old one has finished. These options may be necessary to avoid
  bad behavior when certain built-in effects like "slideUp" and "slideDown" are toggled rapidly.

Unrecognized properties are passed as options to Velocity (e.g. `duration`, `delay`, `loop`).

#### Methods

`runAnimation`: Triggers the animation immediately. Useful for when you want an animation that
  corresponds to an event but not a particular model state change (e.g. a "bump" when a click
  occurs).


### `VelocityTransitionGroup`

Component to add Velocity animations around React transitions. Delegates to the React `TransitionGroup`
addon.

#### Example
```JSX
  <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
    {this.state.renderSubComponent ? <MySubComponent/> : undefined}
  </VelocityTransitionGroup>
```

#### Properties
`enter`: Animation to run on a child component being added

`leave`: Animation to run on a child component leaving

`runOnMount`: if true, runs the `enter` animation on the elements that exist as children when this
  component is mounted.

Any additional properties (e.g. `className`, `component`) will be passed to the internal
`TransitionGroup`.

`enter` and `leave` should either be a string naming an animation registered with UI Pack, or a hash
with an `animation` key that can either be a string itself, or a hash of style attributes to animate
(this value is passed to Velocity its the first arg).

**Note:** To make it easier to write consistent “enter” animations, the “leave” animation is applied
to elements before the “enter” animation is run. So, for something like opacity, you can set it at
0 in “leave” and 1 in “enter,” rather than having to specify that “enter” should start at 0.

If `enter` or `leave` is a hash, it can additionally have a `style` value that is applied the tick
before the Velocity animation starts. Use this for non-animating properties (like `position`) that
are prerequisites for correct animation. The style value is applied using Velocity's JS -> CSS
routines, which may differ from React's.

Any hash entries beyond `animation` and `style` are passed in an options hash to Velocity. Use this
for options like `stagger`, `reverse`, *&c.*

#### Statics

`disabledForTest`: Set this to true globally to turn off all custom animation logic. Instead, this
  component will behave like a vanilla `TransitionGroup`.

### `velocityHelpers`

#### `registerEffect`

Takes a Velocity "UI pack effect" definition and registers it with a unique key, returning that
key (to later pass as a value for the `animation` property). Takes an optional `suffix`, which can
be "In" or "Out" to modify UI Pack's behavior.

Unlike what you get from passing a style hash to `VelocityComponent`'s `animation` property,
Velocity "UI pack effects" can have chained animation calls and specify a `defaultDuration`, and
also can take advantage of `stagger` and `reverse` properties on the `VelocityComponent`.

You will need to manually register the UI Pack with the global Velocity in your application with:
```JS
  require('velocity-animate');
  require('velocity-animate/velocity.ui');
```

If, even with the above statements, you see errors like `Velocity: First argument
(transition.shrinkIn) was not a property map, a known action, or a registered redirect. Aborting.`
it is likely that there are 2 copies of `velocity-animate` in your `node_modules`. Use `npm dedupe`
to collapse them down to one.

It might also be necessary to require the `velocity-animate` package explicitly in your package.json.

See: http://velocityjs.org/#uiPack

### Server-side rendering

The `VelocityComponent` and `VelocityTransitionGroup` components are (as of v1.0.1)
tolerant of being rendered on the server: they will no-op and render their children
naturally. If your initial animation end states match
natural rendering this will be exactly what you want. Otherwise, you may notice a
flash when the JS is applied and the initial animations are resolved.

## Bugs
Please report any bugs to: <https://github.com/twitter-fabric/velocity-react/issues>

**We welcome contributions!** Note that when testing local changes against local projects you’ll
need to avoid `npm link` since it typically will cause duplicate instances of `React` in the client.
(You’ll often see this manifest as `firstChild undefined` errors.)

## Acknowledgments
Thanks to Julian Shapiro and Ken Wheeler for creating and maintaining Velocity, respectively,
and for working with us to release this library.

Thanks to Kevin Robinson and Sam Phillips for all of the discussions and code reviews.

## License
Copyright 2017 Google Inc.

Licensed under the MIT License: https://opensource.org/licenses/MIT
