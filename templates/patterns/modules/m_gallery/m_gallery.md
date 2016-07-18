---
title: Gallery
---
`m_gallery` renders a one or more images as a gallery. Javascript is used to add a 'brick-wall' effect and to enhance the captions. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_gallery)

### Nunjucks macro call

```
pattern.m_gallery(images,type,group,caption)
```

### Attributes

Attribute | Description| Required?
---|---|---
`images`|An array of image objects|Yes
`type`|String value of `articles`, `gallery` or `notes`|Yes
`group`|Int, sets how many images per row. Defaults to `3`|
`caption`|Bool, show the captions for the images? Defaults to `false`|

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
pattern.m_gallery(images,type='gallery',caption=true)
```
