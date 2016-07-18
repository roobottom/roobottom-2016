---
title: Article post
---
`m_postArticle` renders the full body of an article post. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_postArticle)

### Nunjucks macro call
```
pattern.m_postArticle(post)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`post`|A post object|Yes

### Objects

You can view a [sample article post object here](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/_test_data/article.json).


### Modifiers

This patten doesn't have any modifiers.

### Example

```
  pattern.m_postArticle(eg_article)
```
