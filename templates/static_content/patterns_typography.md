Typography styling is available via a wrapper class `.type`, which styles tags contained therein. It's also available via `#type()` mixins.

The scope of text styling is limited to those tags available via Markdown. This is a stylistic choice, as I don't really like mixing inline HTML tags with Markdown. There are a couple of exceptions to this, detailed below.

All articles on this site are contained within `.grid--prose` which, when combined with `.type` styling, sets sensible line lengths.

# Heading 1
`.type h1` or `#type > .h1()` is used to give an element heading-1 styling. A `h1` tag should only ever be used once per page. I've made an exception here for the purposes of demonstration.

## Heading 2
`.type h2` or `#type > .h2()` is used to give an element heading-2 styling. A `h2` tag is used within an article to introduce a new concept, and can be used multiple times per page.

### Heading 3
`.type h3` or `#type > .h3()` is used to give an element heading-3 styling. A `h3` tag is used within an article to separate a concept into more readable chunks, and can be used multiple times per page.

## Standard text styling

All paragraph sized text is styled with `#type > .default()`.

Paragraph text is set in `p` tags. The mixin `#type > .p()` can also be used to style elements as if they were standard `p` elements.

## Unordered lists

Unordered lists are contained within `ul` and `li` tags. These can be nested with multiple levels receiving different indents and bullet styling, for example:

- Droids
  - C-3P0
    - Humanoid
    - Protocol Droid
  - R2-D2
	- Non Humanoid
	- Astromech Droid
	
## Ordered lists

Ordered lists are contained within `ol` and `li` tags. These can be nested with multiple levels receiving different indents and bullet styling, for example:

1. Films
  1. Star Wars
    1. Episode IV - A New Hope
    2. Episode V - The Empire Strikes Back
    3. Episode VI - Return of the Jedi
  2. Back to the Future
  	1. Part I
  	2. Part II
  	3. Part III
  	
## Horizontal Rule

A `hr` element can be used, much like a `h2` element, when there's a change in concept or thematic change within an article.

---

## Blockquotes

The `blockquote` tag is used for quoting another source. I've chosen to quote any sources inline with the quote itself, without any further tags, simply separated with an `emdash` character. This is due to there being no support for citations in Markdown.

> Hokey religions and ancient weapons are no match for a good blaster at your side, kid. 
> -- [Han Solo](http://www.imdb.com/character/ch0000002/quotes)

## Code Blocks

A block of code can be presented in a `pre` and `code` block.

```
function(variable) {
  variable.map(v => {
  	alert(v);
  });
};
```

## Inline Elements

There's the usual collection of inline element styling to decorate a whole myriad of tags used within text.

### Links

The `a` tag is used to link text to either [other web pages](http://www.starwars.com/), or [anchors](#links) on the same page.

It's also worth mentioning that link styling is based upon the page type, i.e., gallery links are red, etc.

### Bold and Italic

Text that requires _emphasis or italic_ styling uses the `em` tag. Similarly, any text that requires **strong or bold** styling uses the `strong` tag.

### Strikethrough

Text that's been corrected uses the `del` tag to denote a correction, and a `strong` tag to indicate the correct text, for example: ~~Ham Solo~~ **Han Solo**.

### Abbreviations

Currently not supported in Markdown, but useful enough to warrant inline HTML. The `abbr` tag with a `title` attribute is used to denote an abbreviations, for example:

In the last few years, <abbr title="Light Emitting Diodes">LEDs</abbr> have become much cheaper and widely available, mainly because of better manufacturing techniques of blue-coloured LEDs.

### Inline Code

Any reference to text that's designed to be interpreted by a computer, such as `.classnames` or `{% raw %}{{ nunjucksTags }}{% endraw %}` can be styled with an inline `code` tag.

## Tabular Data

Github Flavoured Markdown adds the ability to markup tables, like so:

Character | Actor
--- | ---
Han Solo | Harrison Ford
Luke Skywalker | Mark Hamill
Princess Leia | Carrie Fisher