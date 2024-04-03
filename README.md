## In-progess

Day 02/03
- impelement component base
- implement diff algrothim
- implement hooks
- static node:
```jsx
function StaticNode() {
  // this vNode will not be normalized because children shape is static and no shape needs to be added
  return (
    <div>Static</div>
  )
}
```

Todo:
- remove _parent in vdom
- use flags in vnode to define Component/Elements type
- implemenet dangerouslySetInnerHTML

## Inspired
- [Preact](https://preactjs.com/)
- [Inferno](https://www.infernojs.org/)
