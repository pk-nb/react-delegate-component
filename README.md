# React Delegate Component

Delegation is a powerful design pattern that allows callers to replace and extend behavior through an API. In React, we can delegate how we render UI in Components through props, where the internal component can call a prop function to return elements. This pattern is commonly referred to as `renderProps`.

This pattern works well for sharing logic and building flexible Components and UI libraries. However, if you use a lot of renderProps you start to realize the awkwardness of supporting the following use-cases.

- Rendering both functions _and_ class components.
- Providing a default delegate.
- Being able to render that default from within your delegate (wrapping it, etc).

These are all reasonable things you will likely want to provide functionality for, especially in a UI library. Thankfully, `react-delegate-component` provides the `Delegate` component to support all these use-cases easily and efficiently.

```js
<Delegate
  to={this.renderItem}
  default={DefaultItem}
  props{{ label: this.props.items[i] }}
/>
```

If you are unfamiliar with delegation as a pattern, I recommend reading through the [motivation section](#motivation) in this README and [reading up on renderProps](https://reactjs.org/docs/render-props.html). Note that many examples in the wild only use a single renderProp (`render` or `children`), but you can have many depending on what you need to delegate.


This Component will work for both React and React Native as it does not render any specific markup.

## Installation

Install with the package manager of your choice:

```sh
# using yarn
yarn add react-delegate-component

# using npm
npm install --save react-delegate-component
```


Import the component with the module system of your choice:

```js
import Delegate from "react-delegate-component";

// or

const Delegate = require("react-delegate-component");
```


## Usage

Use a delegate in your component to yield a convenient API for any consumers of your component. For example:

**A fancy list where items are delegated**

We'll provide a default, which can be replaced or extended.

```js
// Definition
function DefaultItem({ label }) {
  return (
    <div className="fancy-item">
      {label}
    </div>
  );
}

class FlexibleList extends React.Component {
  static propTypes = {
    labels: arrayOf(string).isRequired
    renderItem: func
  };

  render() {
    return (
      <div {...fancyStyles}>
        {labels.map(label => (
          <Delegate
            to={this.renderItem}
            default={DefaultItem}
            props={{ label }}
          />
        ))}
      </div>
    );
  }
}

// Usage
const items = ["Apples", "Bananas", "Carrots"];


// Default list
<FlexibleList items={items} />

// Replacing inline
<FlexibleList items={items} renderItem={({ label }) => <div></div>} />

// Replacing with any Component (functional or class)
<FlexibleList items={items} renderItem={EvenFancierItem} />

// Extending default with additional markup
<FlexibleList
  items={items}
  renderItem={({ label, Default }) => <div><Checkbox /><Default></div>}
/>

// Extending default with additional markup, overriding label on Default
<FlexibleList
  items={items}
  renderItem={({ label, Default }) => <div><Default label={`${label}!!!`}></div>}
/>
```

## API

### `to` (aliases: `render`, `children`)

```
type: ({ Default?, ...props }) => node
default: undefined
```

The prop which represents the passed in delegate.

Takes a function or class component. This function/Component is passed all of the `props` from the `props` prop. It is also passed a special prop called `Default`, which can be rendered by the delegate. The `Default` component already has all `props` curried onto it. These props can be overridden in the delegate.

This function should return any React-renderable (propType: `node`).

If `undefined`, the Component will render the `default` prop if available, or nothing (returning `null`).

### `default`

```
type: (props) => node
default: undefined
```

Takes a function or class component. Just like `to`,  this function/Component is passed all of the `props` from the `props` prop.

This function should return any React-renderable (propType: `node`).

If `undefined`, the Component will render the `render` prop if available, or nothing (returning `null`).


### `props`

```
type: object
default: {}
```

An single object which represents all props to pass to both the `to` and `default` props.

### `passDefault`

```
type: boolean
default: true
```

A prop which signifies whether the `Default` prop should be passed down to the delegate. Usually you want this to be on, but there are some cases where you don't want to expose the `Default` to callers.

## Why not just add default props and be done with it?

If you don't need to render the default in you delegate and still want to support class components, you don't need this package and can do something like this:

```js
class ManualDelegation extends React.Component {
  static defaultProps = {
    renderItem: DefaultItem
  };

  render() {
    const RenderItem = this.props.renderItem;
    return <RenderItem some={props} />
  }
}
```

Make sure you render the delegate through JSX, otherwise you will not be able to support class components. In large codebases, I have found that it is easy to get delegates wrong with accidental extra arguments or non-JSX calls. I recommend using this package to be explicit and fool-proof, and to generally provide the `Default` as part of your API.
