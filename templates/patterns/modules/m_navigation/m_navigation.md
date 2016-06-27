`m_navigation` renders a navigation block. [View the source code for this pattern](https://github.com/roobottom/roobottom-express/tree/master/templates/patterns/modules/m_navigation)

### Nunjucks macro call

```
pattern.m_navigation(items, active, modifier, classes)
```

### Attributes
Attribute | Description | Required
--- | --- | ---
`items`|An array of objects. See table below.|Yes
`active`|A URI formatted string that matches the `name` attribute of the current item from the `items` array.|
`modifier` | A single modifier keyword|
`classes` | A string of classes|

### Object: `items`

Attribute | Description | Required
--- | --- | ---
`name`|The title of the link|Yes
`url`|The url of the link|Yes

### Modifiers

Modifier | Description
--- | ---
`sub`|Renders an inline navigation block with sub navigation styling.
`sub-stacked`|enders an stacked navigation block with sub navigation styling

### Example

```
  pattern.m_navigation([
    {name:'Homepage',url:'/'},
    {name:'Articles',url:'/articles'},
    {name:'Gallery',url:'/gallery'},
    {name:'Notes',url:'/notes'},
    {name:'Pattern Library',url:'/patterns'}
  ],active='pattern-library')
```
