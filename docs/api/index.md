# API
## `on`
**Descriptions:**

Add event listener.

**Typing:**

```ts
((
  type: string,
  el: EventTarget,
  handler: (e: Event) => any,
  useCapture?: boolean) => void) &
((
  type: string,
  el: EventTarget,
  handler: (e: Event) => any,
  options?: EventListenerOptions) => void)
```

## `off`
**Descriptions:**

Remove event listener.

**Typing:**

```ts
((
  type: string,
  el: EventTarget,
  handler: (e: Event) => any,
  useCapture?: boolean) => void) &
((
  type: string,
  el: EventTarget,
  handler: (e: Event) => any,
  useCapture?: EventListenerOptions) => void)
```
