# Dialogr

## About

This is a lightbox/modal library that uses only plain ol' JavaScript and native HTML elements, namely the **dialog** element. Given that, there is still very limited support for the dialog element (see [canisee](https://caniuse.com/#search=dialog). So you probably shouldn't use this in a production setting (yet)

## How To Use

Using is super easy. There are two steps to using dialogr, first you need to require and set it up:

```
const Dialogr = require('dialogr');
Dialogr.setup();
```

That gets the styles and all that good stuff in your page. 

Next, there are only two things you need when calling dialogr:

* The elements that will trigger the modal
* An options object.

Note: when adding a trigger, there are two functions you can call. The old function was `Dialogr.dialogr(...)`, however **there is a new alias that should be used:** `Dialogr.addTrigger(...)`.

There are only a couple options: 

* gallery
* type
* content
* openAction

The type option can be either 'image' or 'html'. The default value is 'html'. The gallery option is a boolean for whether there should be gallery controls on the lightbox, this is only available for 'image' types. Content is only available when the lightbox type is 'html'. As the name suggests... it accepts html. The openAction option sets the user action to open the dialog (click, dblclick, etc).

Here's an example:

```
let galleryImages = document.querySelectorAll('.gallery-image');
Dialogr.addTrigger(galleryImages, {
  gallery: true,
  type: 'image',
});
```

Here's an example of an HTML type lightbox:

```
let htmlDialogTrigger = document.querySelectorAll('.js-trigger-dialog');
Dialogr.addTrigger(htmlDialogTrigger, {
  content: `<p>This is some HTML content!</p>
    <p>Warm fuzzy feelings</p>`,
});
```

It's possible to open a modal without adding any triggers to it - simply pass the boolean `false` in place of an array of triggers and it will immediately open:

```
Dialogr.addTrigger(false, {
  content: `<p>This is some HTML content that's opened automatically!</p>`,
});
```

Any element can be image modal triggers, they will need either a `src` attribute OR a data attribute `dialogr-src`. Here's an example of a button that opens an image modal (would work with the first example):

```
<button class="gallery-image" data-dialogr-src="https://www.nasa.gov/sites/default/files/thumbnails/image/discover_missions_banner.jpg">I open an image too!</button>
```

It's also possible to add captions to images displayed in the lightbox, there are two way to do it:

1. Add the `data-dialogr-caption` attribute to the image that gets passed into dialogr
2. If the image is part of a figure and has a figcaption as a sibling, the figcaption's text will be pulled into the dialog.
