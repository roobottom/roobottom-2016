This is my pattern library, a collection of all elements used thoughout the site. I really love pattern libraries, and spend lots of my time at work thinking about them. So when it came to rebuilding this site it made sense to take a "patterns first" approach.

I also wanted to share a little of the philosophy behind this library, how it's built and how patterns are the single source of truth for **all** markup on this site.

## Why?

* Flexible
* Specific for use (i.e., grids are designed around the content, rather than the other way around).

## How?

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
  	pattern.block([
  		pattern.pageTitle(title),
  		pattern.m_postArticle(post,false,active)
	])
  ],'prose')
}}
{% endblock %}
```
{% endraw %}

Exactly what each pattern does, its markup, and required data is detailed in the rest of these pages.