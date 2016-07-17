---
title: Block
---
`c_block` is a utility container that outputs any patterns passed in. [View the source code for this pattern.](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/containers/c_block)

### Nunjucks macro call

```
c_block(items)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`items` | An array of patterns _or_ objects | Yes

### Modifiers

This pattern has no modifiers

### Example

```
pattern.c_block([
'<div class="eg">Example Pattern</div>',
'<div class="eg">Example Pattern</div>',
'<div class="eg">Example Pattern</div>'
])
```
