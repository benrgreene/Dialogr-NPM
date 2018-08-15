exports.dialogr = function() {
  // Make sure our dialog element is in the body
  document.querySelector('body').innerHTML += `
    <dialog id="js-dialog">
      <div class="dialog-content"></div>
      <div class="dialog-close">&times;</div>
      <div id="js-dialog-previous" class="dialog-previous">&larr;</div>
      <div id="js-dialog-next" class="dialog-next">&rarr;</div>
    </dialog>
    <style>dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);border:0;padding:20px;max-height:90vh;max-width:90vw;overflow:hidden}dialog::backdrop{background-color:rgba(10,10,10,.8)}.dialog-close{content:'X';position:absolute;top:5px;right:5px;cursor:pointer}.dialog-next,.dialog-previous{position:absolute;top:50%;width:20px;transform:translateY(-50%);text-align:center;cursor:pointer}.dialog-previous{left:0}.dialog-next{right:0}.dialog-content{text-align:center}.dialog-content[data-current-gallery-index=false]~.dialog-next,.dialog-content[data-current-gallery-index=false]~.dialog-previous{display:none}.dialog-content img{display:block;max-width:100%;max-height:100%;object-fit:scale-down}</style>`;

  // Now that the dialog is there, we can make our declarations
  let dialog        = document.querySelector('#js-dialog');
  let dialogContent = document.querySelector('#js-dialog .dialog-content');
  let dialogClose   = document.querySelectorAll('.dialog-close');
  let dialogPrev    = document.querySelector('#js-dialog-previous');
  let dialogNext    = document.querySelector('#js-dialog-next');
  let maxSlides     = 0;

  // Add event listeners for all the close buttons
  dialogClose.forEach(function(e) {
    e.addEventListener('click', function(event) {
      dialog.close();
      event.preventDefault();
    });
  });

  // Will check whether or not a click event was on the element proper, or outside it (on, say, a pseudo element)
  function checkClickInsideBoundingBox(event, element) {
    elementPos = element.getBoundingClientRect();
    if(elementPos.left <= event.clientX && elementPos.right >= event.clientX &&
       elementPos.top <= event.clientY && elementPos.bottom >= event.clientY) {
      return true; 
    }
    return false;
  }

  // Add the image to the dialog element
  function displayImage(element) {
    let currentGalleryIndex = '';
    let imageSrc = element.src;
    // Allow for image type triggers on non-image elements
    if(element.dataset.dialogrSrc) {
      imageSrc = element.dataset.dialogrSrc;
    }
    // set gallery index IF it exists
    if(element.dataset.dialogrIndex) {
      dialogContent.dataset.currentGalleryIndex = element.dataset.dialogrIndex;
    }
    dialogContent.innerHTML = '<img src="' + imageSrc + '" ' + currentGalleryIndex + ' />';
    setImageMaxDim();
  }

  function displayHTMLContent(content) {
    dialogContent.dataset.currentGalleryIndex = false;
    dialogContent.innerHTML = content;
  }

  // Init the dialog element and setup gallery info/data attributes
  function dialogr(elements, options) {
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

    elements.forEach(function(e) {
      if(inGallery) {
        e.dataset.dialogrIndex = maxSlides;
        maxSlides++;
      } else {
        e.dataset.dialogrIndex = 'false';
      }
      
      if("image" == type) {
        var el = e;
        el.addEventListener(openAction, function(event) {
          dialog.showModal();
          displayImage(el);
        });
      }
      else if("html" == type) {
        e.addEventListener(openAction, function(event) {
          dialog.showModal();
          displayHTMLContent(options.content);
        });
      }
    });
  }

  // on resize, set image max width/height to be containers width/height (minus padding)
  window.addEventListener('resize', function(event) {
    setImageMaxDim();
  });

  function setImageMaxDim() {
    var dialogImage = document.querySelector('.dialog-content img');
    if(dialogImage) {
      dialogImage.style.maxHeight = '';
      // TODO: this should be dynamic
      var padding = dialog.style.paddingTop;
      padding = 40;
      if(dialog.clientHeight > 40) {
        dialogImage.style.maxHeight = (dialog.clientHeight - padding) + 'px';
      } else {
        dialogImage.style.maxHeight = (window.innerHeight - (2 * padding)) + 'px';
      }
    }
  }

  // --------------------------------------------------
  // Gallery Navigation
  // --------------------------------------------------
  function viewNextSlide(event, direction) {
    event.preventDefault();
    event.stopPropagation();
    // Get the current opened image
    var currentIndex  = parseInt(dialogContent.dataset.currentGalleryIndex);
    var nextIndex = currentIndex + direction;
    // Make sure we loop back around if we need to
    nextIndex = (nextIndex < 0) ? maxSlides -1 : nextIndex;
    nextIndex = (nextIndex >= maxSlides) ? 0 : nextIndex;
    // Get the next element
    var previous = document.querySelector('*[data-dialogr-index="' + nextIndex + '"]');
    displayImage(previous);
  }

  // Navigation buttons callbacks
  dialogNext.addEventListener('click', function(event) {
    viewNextSlide(event, 1);
  });
  dialogPrev.addEventListener('click', function(event) {
    viewNextSlide(event, -1);
  });

  // Add arrow key navigation to the dialogs
  document.addEventListener('keydown', function(e) {
    // Check if the dialog is open and is part of a gallery
    var dialogOpen = dialog.open;
    var haveValidIndex = ('false' != dialogContent.dataset.currentGalleryIndex);
    if(!dialogOpen || !haveValidIndex) {
      return;
    }
   
    var char = (e.keyCode) ? e.keyCode : e.which;
    if(39 == char) {
      viewNextSlide(e, 1);
    } else if( 37 == char ) {
      viewNextSlide(e, -1);
    }
  });

  // Want to close the dialog box if the backdrop is clicked
  dialog.addEventListener('click', function(e) {
    const isInside = checkClickInsideBoundingBox(e, dialog);
    if(!isInside) {
      dialog.close();    
    }
  });
}