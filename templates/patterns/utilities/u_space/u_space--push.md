---
title: Push
---
`.u_space--push` adds spacing to the top and/or bottom of an object.

### Less mixin call

```
#u_space > .push(bottom,top);
```

Where `bottom` and `top` are multipliers of the standard vertical spacing. This defaults to `bottom: 1, top: 0`.

### Example

```
<div class="eg u_space--push"/>
<div class="eg">
  This div is "pushed" down by it's preceding sibling.
</div>
```
