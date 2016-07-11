This is my pattern library, a collection of all elements used throughout the site. I really love pattern libraries, and spend lots of my time thinking about them. So when it came to rebuilding this site it made sense to take a _patterns first_ approach.

---

## Why?

This website is not designed as number of pages, but rather as a system of components that can be composed together to form pages. 

Many pattern libraries I've designed in the past served simply as reference documents. They needed to be kept up-to-date if live code changed, and component code had to be manually copied-and-pasted into production. 

This pattern library defines its components in such a way that they can then be called, programmatically, multiple times on any page. 

Unlike some of the larger systems I've designed, I wanted these patterns to be as specific as possible. Usually, the smallest building blocks would be things like buttons, icons, search boxes, etc. I have no reason to define small blocks that can be used cross component, so I've kept things simple by making my building blocks, `modules`, self-contained and specific for purpose.

---

## How?

This pattern library contains definitions for patterns and less mixins, in 5 categories:

* **Grids** define layout. They can contain any other component type.
* **Containers** serve both as top level building blocks, such as headers, and to contain repeating modules.
* **Typography** is a special set of styles just for typesetting.
* **Modules** are self-contained elements that cannot be broken down into smaller patterns. They are usually composed together within grids and containers.
* **Utilities** are a collection of less mixins and classes that can be used by any grid, container or module.

### Patterns

Each pattern is a [Nunjucks Macro](https://mozilla.github.io/nunjucks/templating.html#macro). These accept a number of arguments and define the markup for that pattern.

I use a [Gulp](http://gulpjs.com/) build process to concatenate each pattern into one `patterns.html` file. I then include this in my global layout, so each pattern is available to each page on the site.

A page is passed a data object that can then be passed into a chain of patterns. Nunjucks then compiles that into the markup for that page at run time.

At its very basic, a page might consist of a grid, page-title and post pattern. This _could_ look something like this:

{% raw %}
```
{% extends 'layouts/default.html' %}
{% block body %}
{{
  pattern.grid([
  	pattern.c_block([
  		pattern.m_pageTitle(title),
  		pattern.m_postArticle(post,false,active)
	])
  ],'prose')
}}
{% endblock %}
```
{% endraw %}

Exactly what each pattern does, its markup, and required data is detailed in the rest of these pages.

### Styles

This pattern library uses [less css](http://lesscss.org/) to process css written in the [BEM](https://css-tricks.com/bem-101/) style. These two in combination with the gulp build process lend themselves really well to the component nature of this library.

---

## Further reading

There's a lot written on this subject. I've included a few links to things that have inspired the design of this pattern library:

* Brad Frost's book ["Atomic Design"](http://atomicdesign.bradfrost.com/)
* Anna Debenham's article on ALA ["Getting Started with Pattern Libraries"](http://alistapart.com/blog/post/getting-started-with-pattern-libraries/), collected [Front end styleguides and pattern libraries](https://gimmebar.com/collection/4ecd439c2f0aaad734000022/front-end-styleguides) and her book ["A pocket guide [to] Front-end style guides"](http://www.maban.co.uk/projects/front-end-style-guides/)
* Paul Lloyd's ["Barebones" pattern primer project](http://barebones.paulrobertlloyd.com/)