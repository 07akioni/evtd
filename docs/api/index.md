# API
## `on`
**Descriptions:**

Add event listener.

**Typing:**

```ts
on (
  eventName: string,
  target: EventTarget,
  handler: Function,
  useCapture?: boolean // or options?: EventListenerOptions
) : void
```

**Exapmles:**

```ts
on(window, 'click', () => console.log('window-click'))
on(document, 'click', () => console.log('document-click'))
on(eventTarget, 'click', () => console.log('some-element-click'))
```

## `off`
**Descriptions:**

Remove event listener.

**Typing:**

```ts
off (
  eventName: string,
  target: EventTarget,
  handler: Function,
  useCapture?: boolean // or options?: EventListenerOptions
) : void
```

**Exapmles:**

```ts
off(window, 'click', registeredHandler)
off(document, 'click', registeredHandler)
off(eventTarget, 'click', registeredHandler)
```

