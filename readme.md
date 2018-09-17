# Dialogr

## About

This is a lightbox/modal library that uses only plain ol' JavaScript and native HTML elements, namely the **dialog** element. Given that, there is still very limited support for the dialog element (see [canisee](https://caniuse.com/#search=dialog). So you probably shouldn't use this in a production setting (yet)

## How To Use

Using is super easy. There are only two things you need when calling dialogr:

* The elements that will trigger the modal
* An options object.

There are only a couple options: 

* gallery
* type
* content 

The type option can be either 'image' or 'html'. The default value is 'html'. The gallery option is a boolean for whether there should be gallery controls on the lightbox, this is only available for 'image' types. Content is only available when the lightbox type is set to 'html'. As the name suggests... it accepts html.

Here's an example:

```
let galleryImages = document.querySelectorAll('.gallery-image');
dialogr(galleryImages, {
  gallery: true,
  type: 'image',
});
```

This instantiates a lightbox, with gallery mode enabled, for all images with the class `.gallery-image`. It's also possible to add captions to images displayed in the lightbox, there are two way to do it:

1. Add the `data-dialogr-caption` attribute to the image that gets passed into dialogr
2. If the image is part of a figure and has a figcaption as a sibling, the figcaption's text will be pulled into the dialog.

Here's an example of an HTML type lightbox:

```
let htmlDialogTrigger = document.querySelectorAll('.js-trigger-dialog');
dialogr(htmlDialogTrigger, {
  content: `<p>This is some HTML content!</p>
    <p>Warm fuzzy feelings</p>`,
});
```

Any element can be image modal triggers, they will need either a `src` attribute OR a data attribute `dialogr-src`. Here's an example of a button that opens an image modal (would work with the first example):

```
<button class="gallery-image" data-dialogr-src="https://www.nasa.gov/sites/default/files/thumbnails/image/discover_missions_banner.jpg">I open an image too!</button>
```

It's possible to also set the triggering event. The default is simply the click event, but any native event will work. Here's an example:

```
let doubleClickDialogTrigger = document.querySelectorAll('.js-dblclick-dialog');
dialogr(doubleClickDialogTrigger, {
  openAction: 'dblclick',
  content: `<p>This is opened by a double click!</p>
    <p>So fancy.</p>`,
});
```