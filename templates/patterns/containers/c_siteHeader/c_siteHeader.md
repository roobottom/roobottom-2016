---
title: Site Header Container
---
`c_siteHeader` is designed to contain the main body of the site. It outputs any patterns passed in. [View the source code for this pattern.](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/containers/c_siteHeader)

### Nunjucks macro call

```
c_siteHeader(items)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`items` | An array of patterns _or_ objects | Yes

### Modifiers

This pattern has no modifiers

### Example

```
pattern.c_siteHeader(['<div class="eg">Site Header</div>'])
```
