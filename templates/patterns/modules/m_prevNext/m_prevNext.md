`m_prevNext` renders an previous / next navigation block. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_prevNext)

### Nunjucks macro call

```
m_prevNext(type,date,prev,next)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`type`|String of type `articles`, `gallery` or `notes`|Yes
`date`|An ISO formatted date of the current post date|Yes
`prev`|A previous post object|
`next`|A next post object|

### Object: `prev`

Attribute | Description | Required
--- | --- | ---
`title`|The title of the previous post|Yes
`date`|An ISO formatted date of the previous post|Yes
`url`|The url of the previous post|Yes

### Object: `next`

Attribute | Description | Required
--- | --- | ---
`title`|The title of the next post|Yes
`date`|An ISO formatted date of the next post|Yes
`url`|The url of the next post|Yes

### Modifiers

This patten doesn't have any modifiers.

### Example

```
pattern.m_prevNext(
  type='articles',
  date='2016-05-16',
  prev={title: 'Jedi mind tricks',
  date: '2016-05-04',
  url: '#'},
  next={title: 'Rebel Scum',
  date: '2016-05-23',
  url: '#'}
)
```
