---
title: Site Body Container
---
`c_siteBody` is designed to contain the main body of the site. It outputs any patterns passed in. [View the source code for this pattern.](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/containers/c_siteBody)

### Nunjucks macro call

```
c_siteBody(items)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`items` | An array of patterns _or_ objects | Yes

### Modifiers

This pattern has no modifiers

### Example

```
pattern.c_siteBody(['<div class="eg">Site Body</div>'])
```
