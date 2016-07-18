---
title: Pull
---
`.u_space--pull` pulls an object out of the horizontal flow of the page. `.u_space--pull-back` restores the horizontal alignment to any child elements to match `.u_space--pull` parent alignment.

### Less mixin calls

```
#u_space > .pull(distance);
#u_space > .pull-back(distance);
```

Where `distance` is the distance in percent you wish to pull. This defaults to `9`.

### Example

```
<div class="eg u_space--pull">
  <p>This div is "pulled" left</p>
  <p class="u_space--pull-back">This paragraph is "pulled-back" in line with the normal left hand edge of the parent container.</p>
</div>
```
