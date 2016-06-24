`m_navigation` renders a navigation block. This defaults to the main navigation styling. A url match is used to replace the home link with the roo-icon.

```
  pattern.m_navigation([
    {name:'Homepage',url:'/'},
    {name:'Articles',url:'/articles'},
    {name:'Gallery',url:'/gallery'},
    {name:'Notes',url:'/notes'},
    {name:'Pattern Library',url:'/patterns'}
  ],active='pattern-library')
```
