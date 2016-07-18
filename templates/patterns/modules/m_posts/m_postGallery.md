---
title: Gallery post
---
`m_postGallery` renders the full body of an gallery post. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_postGallery)

### Nunjucks macro call
```
pattern.m_postGallery(post)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`post`|A post object|Yes

### Objects

You can view a [sample gallery post object here](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/_test_data/gallery.json).


### Modifiers

This patten doesn't have any modifiers.

### Example

```
  pattern.m_postGallery(eg_gallery)
```
