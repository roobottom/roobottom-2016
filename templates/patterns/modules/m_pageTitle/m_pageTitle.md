`m_pageTitle` renders a main page title `h1`. Only one should be used on any page. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_pageTitle)

### Nunjucks macro call

```
pattern.m_pageTitle(title,date,modifier,classes)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`title` | The page title text | Yes
`date` | A ISO formatted date|
`modifier` | A single modifier keyword|
`classes` | A string of classes|

### Modifiers

Modifier | Description
--- | ---
`aligned`|Turns off central alignment on wider screens

### Example

```
pattern.m_pageTitle('Jedi mind tricks','20160504')
```
