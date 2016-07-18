---
title: Pagination
---
`m_pagination` renders a set of pagination links. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_pagination)

### Nunjucks macro call

```
m_pagination(baseUrl,pagination)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`baseUrl`|The base url for all pagination items|Yes
`pagination`|A pagination object|Yes

### Object: `pagination`

Attribute | Description | Required
--- | --- | ---
`url`|The url of the link, relative to the `baseUrl`|Yes
`title`|The title of the link|Yes
`current`|Bool, is the current link? Defaults to `false`|

### Modifiers

This patten doesn't have any modifiers.

### Example

```
  pattern.m_pagination('/patterns/modules/',[
    {url:'#', title: '1'},
    {url:'#', title: '2', current: true},
    {url:'#', title: '3'}
  ])
```
