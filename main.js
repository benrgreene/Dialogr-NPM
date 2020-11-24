module.exports = {
  setup: function() {
    // Make sure our dialog element is in the body
    document.querySelector('body').innerHTML += `
      <dialog id="js-dialog">
        <div class="dialog-content"></div>
        <div class="dialog-close">&times;</div>
        <div id="js-dialog-previous" class="dialog-previous">&larr;</div>
        <div id="js-dialog-next" class="dialog-next">&rarr;</div>
      </dialog>
      <style>dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);margin:0;border:0;padding:20px;max-height:90vh;max-width:90vw;overflow:hidden}dialog::backdrop{background-color:rgba(10,10,10,.8)}dialog figure{margin: 0;}.dialog-close{content:'X';position:absolute;top:5px;right:5px;cursor:pointer}.dialog-next,.dialog-previous{position:absolute;top:50%;width:20px;transform:translateY(-50%);text-align:center;cursor:pointer}.dialog-previous{left:0}.dialog-next{right:0}.dialog-content{text-align:center}.dialog-content[data-current-gallery-index=false]~.dialog-next,.dialog-content[data-current-gallery-index=false]~.dialog-previous{display:none}.dialog-content img{display:block;max-width:100%;max-height:100%;object-fit:scale-down}</style>`;
    
    // Now that the dialog is there, we can make our declarations
    this.dialog = document.querySelector('#js-dialog');
    this.dialogContent = document.querySelector('#js-dialog .dialog-content');
    this.dialogClose = document.querySelectorAll('.dialog-close');
    this.dialogPrev = document.querySelector('#js-dialog-previous');
    this.dialogNext = document.querySelector('#js-dialog-next');
    this.maxSlides = 0;

    // Add event listeners for all the close buttons
    let self = this;
    this.dialogClose.forEach(function(e) {
      e.addEventListener('click', function(event) {
        self.dialog.close();
        event.preventDefault();
      });
    });
    
    // on resize, set image max width/height to be containers width/height (minus padding)
    window.addEventListener('resize', function(event) {
      self.setImageMaxDim();
    });
    // Navigation buttons callbacks
    this.dialogNext.addEventListener('click', function(event) {
      self.viewNextSlide(event, 1);
    });
    this.dialogPrev.addEventListener('click', function(event) {
      self.viewNextSlide(event, -1);
    });
    // Want to close the dialog box if the backdrop is clicked
    this.dialog.addEventListener('click', function(e) {
      const isInside = self.checkClickInsideBoundingBox(e, self.dialog);
      if(!isInside) {
        self.dialog.close();
      }
    });
    // Add arrow key navigation to the dialogs
    document.addEventListener('keydown', function(e) {
      // Check if the dialog is open and is part of a gallery
      var dialogOpen = self.dialog.open;
      var haveValidIndex = ('false' != self.dialogContent.dataset.currentGalleryIndex);
      if(!dialogOpen || !haveValidIndex) {
        return;
      }
     
      var char = (e.keyCode) ? e.keyCode : e.which;
      if(39 == char) {
        self.viewNextSlide(e, 1);
      } else if( 37 == char ) {
        self.viewNextSlide(e, -1);
      } else if( 27 == char ) {
        self.dialog.close();
      }
    });
  },
  // Will check whether or not a click event was on the element proper, or outside it (on, say, a pseudo element)
  checkClickInsideBoundingBox: function(event, element) {
    let elementPos = element.getBoundingClientRect();
    if(elementPos.left <= event.clientX && elementPos.right >= event.clientX &&
       elementPos.top <= event.clientY && elementPos.bottom >= event.clientY) {
      return true; 
    }
    return false;
  },
  // Add the image to the dialog element
  displayImage: function(element) {
    let currentGalleryIndex = '';
    let imageCaption        = false;
    let imageSrc            = element.src;
    // Allow for image type triggers on non-image elements
    if(element.dataset.dialogrSrc) {
      imageSrc = element.dataset.dialogrSrc;
    }
    // set gallery index IF it exists
    if(element.dataset.dialogrIndex) {
      this.dialogContent.dataset.currentGalleryIndex = element.dataset.dialogrIndex;
    }
    // Check if there is a caption for the image
    if (element.dataset.dialogrCaption) {
      imageCaption = element.dataset.dialogrCaption;
    } else if ('FIGURE' == element.parentElement.tagName) {
      let allChildren = Array.from(element.parentElement.children);
      imageCaption = allChildren.reduce((figCaption, currentElement) => {
        return ('FIGCAPTION' == currentElement.tagName) ? currentElement.innerHTML : figCaption;
      }, false);
    }
    // Set the dialog content
    if (false !== imageCaption) {
      this.dialogContent.innerHTML = `<figure><img src="${imageSrc}" ${currentGalleryIndex} /><figcaption>${imageCaption}</figcaption></figure>`;
    } else {
      this.dialogContent.innerHTML = `<img src="${imageSrc}" ${currentGalleryIndex} />`;
    }
    this.setImageMaxDim();
  },
  displayHTMLContent: function(content) {
    this.dialogContent.dataset.currentGalleryIndex = false;
    this.dialogContent.innerHTML = content;
  },
  addTrigger: function(elements, options) {
    this.dialogr(elements, options);
  },
  // Init the dialog element and setup gallery info/data attributes
  dialogr: function(elements, options) {
    // Default is html & no gallery - doesn't allow gallery with HTML content, only with images.
    var type = 'html';
    if( undefined !== options.type && 
        'image' === options.type ) {
      var type = 'image';  
    }
    
    var inGallery = false; 
    if( undefined !== options.gallery && 
        true === options.gallery &&
        'image' === type ) {
      inGallery = true;
    }

    var openAction = 'click';
    if( undefined !== options.openAction ) {
      openAction = options.openAction;
    }

    let self = this;

    // auto open if there are no elements to bind to
    if (elements === false) {
      self.dialog.showModal();
      self.displayHTMLContent(options.content);
    }
    
    elements && elements.forEach(function(e) {
      if(inGallery) {
        e.dataset.dialogrIndex = self.maxSlides;
        self.maxSlides++;
      } else {
        e.dataset.dialogrIndex = 'false';
      }
      if("image" == type) {
        var el = e;
        el.addEventListener(openAction, function(event) {
          self.dialog.showModal();
          self.displayImage(el);
        });
      }
      else if("html" == type) {
        e.addEventListener(openAction, function(event) {
          self.dialog.showModal();
          self.displayHTMLContent(options.content);
        });
      }
    });
  },
  // set the max height of the image so it doesn't overflow off the dialog.
  // should include modal padding & caption height
  setImageMaxDim: function() {
    var dialogImage   = document.querySelector('.dialog-content img');
    var dialogCaption = document.querySelector('.dialog-content figcaption');
    let captionHeight = (dialogCaption) ? dialogCaption.clientHeight : 0;
    if(dialogImage) {
      dialogImage.style.maxHeight = '';
      var padding = this.dialog.style.paddingTop;
      padding = 40;
      if(this.dialog.clientHeight > 40) {
        dialogImage.style.maxHeight = (this.dialog.clientHeight - padding - captionHeight) + 'px';
      } else {
        dialogImage.style.maxHeight = (window.innerHeight - (2 * padding) - captionHeight) + 'px';
      }
    }
  },

  // --------------------------------------------------
  // Gallery Navigation
  // --------------------------------------------------
  viewNextSlide: function(event, direction) {
    event.preventDefault();
    event.stopPropagation();
    // Get the current opened image
    var currentIndex  = parseInt(this.dialogContent.dataset.currentGalleryIndex);
    var nextIndex = currentIndex + direction;
    // Make sure we loop back around if we need to
    nextIndex = (nextIndex < 0) ? this.maxSlides -1 : nextIndex;
    nextIndex = (nextIndex >= this.maxSlides) ? 0 : nextIndex;
    // Get the next element
    var previous = document.querySelector('*[data-dialogr-index="' + nextIndex + '"]');
    this.displayImage(previous);
  }
}