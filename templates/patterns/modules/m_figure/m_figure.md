`m_figure` renders a one or more images in a single row. Also available as a smartTag. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_figure)

### Nunjucks macro call

```
pattern.m_figure(images,type)
```

### Attributes

Attribute | Description| Required?
---|---|---
`images`|An array of image objects|Yes
`type`|String value of `articles`, `gallery` or `notes`|Yes

### Object: `images`

Attribute | Description | Required
--- | --- | ---
`image`|The uri of the image|Yes
`caption`|A caption string|
`width`|The width of the image in pixels|
`height`|The height of the image in pixels|

### Modifiers

This pattern doesn't have any modifiers.

### Example

```
pattern.m_figure(images,'articles');
```
