# velocity-react

[React](http://facebook.github.io/react/) components for interacting with the
[Velocity](http://julian.com/research/velocity/) DOM animation library.

Read our [announcement blog post](https://fabric.io/blog/introducing-the-velocityreact-library) for
details about why and how we built this.

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

It is assumed that your application already depends on React. The `VelocityTransitionGroup`
component particularly requires the React addons at version 0.13 or higher.

## Usage

### `VelocityComponent`

Component to add Velocity animations to one or more children. Wraps a single child without adding
additional DOM nodes.

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
  when you're confident that React's reconcilliation will preserve these nodes during animation.
  Also note `querySelectorAll`'s [silly behavior](http://ejohn.org/blog/thoughts-on-queryselectorall/) w.r.t. pruning results when being called on a node.
  A special value of "children" will use the direct children of the node, since there isn't a
  great way to specify that to `querySelectorAll`.

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

If `enter` or `leave` is a hash, it can additionally have a `style` value that is applied the tick
before the Velocity animation starts. Use this for non-animating properties (like `position`) that
are prerequisites for correct animation. The style value is applied using Velocity's JS -> CSS
routines, which may differ from React's.

Any hash entries beyond `animation` and `style` are passed in an options hash to Velocity. Use this
for options like `stagger`, `reverse`, *&tc.*

#### Statics

`disabledForTest`: Set this to true globally to turn off all custom animation logic. Instead, this
  component will behave like a vanilla TransitionGroup`.

### `velocityHelper`

#### `registerEffect`

Takes a Velocity "UI pack effect" definition and registers it with a unique key, returning that
key (to later pass as a value for the `animation` property). Takes an optional `suffix`, which can
be "In" or "Out" to modify UI Pack's behavior.

Unlike what you get from passing a style hash to `VelocityComponent`'s `animation` property,
Velocity "UI pack effects" can have chained animation calls and specify a `defaultDuration`, and
also can take advantage of `stagger` and `reverse` properties on the `VelocityComponent`.

You will need to manually register the UI Pack with the global Velocity in your application with:
```JS
  require('velocity');
  require('velocity-animate/velocity.ui');
```

See: http://julian.com/research/velocity/#uiPack

## Bugs
Please report any bugs to: <https://github.com/twitter-fabric/velocity-react/issues>

## Acknowledgments
Thanks to Julian Shapiro and Ken Wheeler for creating and maintaining Velocity, respectively,
and for working with us to release this library.

Thanks to Kevin Robinson and Sam Phillips for all of the discussions and code reviews.

## License
Copyright 2015 Twitter, Inc.

Licensed under the MIT License: https://opensource.org/licenses/MIT
