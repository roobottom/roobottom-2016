---
title: Wrapper
---
`c_wrapper` Is a slightly shameful utility class that assists with layout. It outputs any patterns passed in. [View the source code for this pattern.](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/containers/c_wrapper)

### Nunjucks macro call

```
c_wrapper(items)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`items` | An array of patterns _or_ objects | Yes

### Modifiers

This pattern has no modifiers

### Example

```
pattern.c_wrapper(['<div class="eg">Wrapper</div>'])
```
