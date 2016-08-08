{{TOC}}

# Building a modular, in-sync pattern library

When I decided that I wanted to redevelop my personal website I had 4 goals in mind:

* **Don’t redesign, evolve**: The site should look like a blood relative of its predecessor. I wanted to concentrate more on the technology in this iteration, so didn’t want to do a full redesign. 
* **Take a modular approach**: Each distinct UI pattern should be it’s own self-contained module. These should compose well together to form layouts and pages.
* **Patterns first**: All markup should be contained within a pattern that can be called either by pages or other patterns. Patterns should the single source of truth for all markup and styling.
* **Ship it**: Make it live as soon as possible, and develop in the open.

This meant that the current technology ([Jekyll](http://jekyllrb.com)) I was using for this site wasn’t up to the task. Thanks in no small part to the boundless patience of the rather brilliant [Danielle Huntrods](https://twitter.com/dhuntrods) in the face of my constant barrage of questions, I decided to build my own back-end using [Node](http://nodejs.com).

I’m not going to dig into any of the details here, but you can read through my [source code](https://github.com/roobottom/roobottom-express) if you’re interested.

## Building modules



Nunjucks is a tempting language for JavaScript with several features that make it ideal for creating reusable patterns. Most useful is the [`macro`](https://mozilla.github.io/nunjucks/templating.html#macro) tag: this allows you to create reusable chunks of code in their own files and import them elsewhere.



```
/patterns
|- /modules
|  - /m_navigation
|     - m_navigation.pattern
|  - /m_pageTitle
|     - m_pageTitle.pattern
```

However, this presented a problem: I would have to manually `import` all my patterns into pages one-by-one. Ideally, what I wanted was a way to import all patterns (including any new ones I created) without having to change the import command.

### Enter Gulp

Thankfully, [Gulp](http://gulpjs.com) is an ideal build tool for this kind of job. Using [gulp-concat](https://www.npmjs.com/package/gulp-concat) I’m able to build one `patterns.html` file which I can then call once

> Make this a bit more fun!

## 


