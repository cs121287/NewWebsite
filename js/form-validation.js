/**
 * Form Validation & Input Formatting Module
 * CasaDelSolAZ - Version 1.1.1
 * Last Modified: 2025-03-31 02:06:02
 * 
 * Features:
 * - Automatic phone number formatting
 * - Cross-browser compatibility
 * - Performance optimized
 */
(function() {
  'use strict';
  
  // Polyfill for Element.closest
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      let el = this;
      do {
        if (el.matches(s) || el.msMatchesSelector(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
  
  // Polyfill for Element.matches
  if (!Element.prototype.matches) {
    Element.prototype.matches = 
      Element.prototype.matchesSelector || 
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector || 
      Element.prototype.oMatchesSelector || 
      Element.prototype.webkitMatchesSelector ||
      function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;            
      };
  }
  
  // Safely initialize when DOM is ready
  const initOnReady = function() {
    // Use event delegation for better performance
    document.addEventListener('input', handleInputEvent, { passive: true });
    document.addEventListener('focus', handleFocusEvent, true); // Use capture
    document.addEventListener('blur', handleBlurEvent, true);   // Use capture
    
    // Initialize any existing form fields
    initializeFormFields();
  };
  
  if (document.readyState !== 'loading') {
    setTimeout(initOnReady, 0); // Use setTimeout instead of requestIdleCallback for compatibility
  } else {
    document.addEventListener('DOMContentLoaded', initOnReady);
  }
  
  function initializeFormFields() {
    try {
      // Find phone fields
      const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
      if (phoneInputs) {
        phoneInputs.forEach(input => {
          // Format existing values
          if (input && input.value) {
            input.value = formatPhoneNumber(input.value);
          }
          
          // Add data attribute for identification
          input.setAttribute('data-format-type', 'phone');
        });
      }
      
      // Find guest count fields
      const guestInputs = document.querySelectorAll('input[name="guests"]');
      if (guestInputs) {
        guestInputs.forEach(input => {
          input.setAttribute('inputmode', 'numeric');
          input.setAttribute('data-format-type', 'number');
          input.setAttribute('min', '1');
          input.setAttribute('max', '1000');
        });
      }
    } catch(e) {
      console.error("Error initializing form fields:", e);
    }
  }
  
  function handleInputEvent(e) {
    if (!e || !e.target) return;
    const input = e.target;
    
    // Phone number formatting
    const formatType = input.getAttribute && input.getAttribute('data-format-type');
    if (formatType === 'phone' || (input.name && input.name === 'phone') || (input.type && input.type === 'tel')) {
      
      const cursorPos = input.selectionStart || 0;
      const oldLength = input.value ? input.value.length : 0;
      
      // Format the phone number
      input.value = formatPhoneNumber(input.value || '');
      
      // Adjust cursor position after formatting
      const newLength = input.value.length;
      const cursorAdjustment = newLength - oldLength;
      
      if (input.setSelectionRange && cursorPos + cursorAdjustment > 0) {
        input.setSelectionRange(cursorPos + cursorAdjustment, cursorPos + cursorAdjustment);
      }
    }
    
    // Guest count validation - ensure numbers only
    if (formatType === 'number' || (input.name && input.name === 'guests')) {
      // Remove non-numeric characters
      const numericValue = input.value ? input.value.replace(/[^0-9]/g, '') : '';
      
      // Only update if changed
      if (input.value !== numericValue) {
        input.value = numericValue;
      }
    }
  }
  
  function handleFocusEvent(e) {
    if (!e || !e.target) return;
    const input = e.target;
    
    // Make sure it's a form input element before proceeding
    if (!input || !input.tagName || !['INPUT', 'TEXTAREA', 'SELECT'].includes(input.tagName.toUpperCase())) {
      return;
    }
    
    // Mark parent form group as focused
    const parent = input.closest ? input.closest('.form-group') : input.parentElement;
    if (parent && parent.classList) {
      parent.classList.add('focused');
    }
  }
  
  function handleBlurEvent(e) {
    if (!e || !e.target) return;
    const input = e.target;
    
    // Make sure it's a form input element before proceeding
    if (!input || !input.tagName || !['INPUT', 'TEXTAREA', 'SELECT'].includes(input.tagName.toUpperCase())) {
      return;
    }
    
    // Find parent .form-group element
    const parent = input.closest ? input.closest('.form-group') : null;
    if (!parent || !parent.classList) return;
    
    // Remove focus class
    parent.classList.remove('focused');
    
    // Add has-value class if input has value
    if (input.value && input.value.trim()) {
      parent.classList.add('has-value');
    } else {
      parent.classList.remove('has-value');
    }
    
    // Live validation
    if (input.hasAttribute && input.hasAttribute('required')) {
      if (!input.value || !input.value.trim()) {
        parent.classList.add('has-error');
        
        if (!parent.querySelector('.error-message')) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'This field is required';
          parent.appendChild(errorMsg);
        }
      } else {
        parent.classList.remove('has-error');
        const errorMsg = parent.querySelector('.error-message');
        if (errorMsg && errorMsg.parentNode) {
          errorMsg.parentNode.removeChild(errorMsg);
        }
        
        // Email validation
        if (input.type === 'email' && !validateEmail(input.value)) {
          parent.classList.add('has-error');
          
          if (!parent.querySelector('.error-message')) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Please enter a valid email address';
            parent.appendChild(errorMsg);
          }
        }
      }
    }
  }
  
  function formatPhoneNumber(value) {
    if (!value) return '';
    
    // Strip all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 0) {
      return '';
    } else if (cleaned.length <= 3) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  }
  
  // Email validation helper
  function validateEmail(email) {
    if (!email) return false;
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Expose API for external use
  window.FormValidator = {
    formatPhoneNumber,
    initializeFormFields
  };
})();