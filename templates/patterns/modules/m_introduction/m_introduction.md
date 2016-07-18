---
title: Introduction
---
`m_introduction` renders an introduction block of text. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_introduction)

### Nunjucks macro call

```
pattern.m_introduction(markdownFile)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`markdownFile`|The uri of a `.md` file|Yes

### Modifiers

This patten doesn't have any modifiers.

### Example

```
  pattern.m_introduction('introduction.md')
```
