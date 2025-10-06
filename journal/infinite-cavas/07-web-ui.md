# Web UI

To make the infinite canvas available across all frameworks (React, Vue etc.), creating it as a web component is the way to go.

The library Lit is designed to build fast and lightweight web components.

## Why web components over framework components?

Creating framework components is fast, especially when you know what the framework well known. It is also ideal when the component will only live in your project (and perhaps other project using the same framework). However, what happens when you want to extend the component to other projects?

I have seen libraries that have separate versions for each different framework. Web component would solve that problem by being usable across different framework.

## Learning lit with infinite canvas

Lit uses decorators to indicate the purpose of the properties of the class you have created.

- All classes that are meant to represent a web component needs to extend from `LitElement`
- Properties have the decorator `@property()` before it
- `@query(selector, cache?)` can be used to select a DOM element
- `connectedCallback` and `disconnectedCallback` are used to handle events during the start and end of the component's lifecycle
- `firstUpdated` is called after the component's DOM has been updated for the first time, we could use this for one-time work after the DOM has been created. We will use this to trigger the initialization of the canvas, start the animation and dispatch an event to let listeners know that the canvas is ready
- `Task` is a controller that takes an async task function and run it (manually or automatically). When rendering this task, you can set the `pending`, `complete` and `error` results
