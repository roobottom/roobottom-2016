---
title: Note post
---
`m_postNote` renders the full body of an note post. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_postNote)

### Nunjucks macro call
```
pattern.m_postNote(post)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`post`|A post object|Yes

### Objects

You can view a [sample note post object here](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/_test_data/note.json).


### Modifiers

This patten doesn't have any modifiers.

### Example

```
  pattern.m_postNote(eg_note)
```
