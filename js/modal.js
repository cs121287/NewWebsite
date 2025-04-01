/**
 * Optimized Contact Form Modal
 * CasaDelSolAZ - Version 2.1.5
 * Last Modified: 2025-03-31 03:11:07
 * 
 * Performance optimizations:
 * - HTTP/2 compatible script loading
 * - Efficient DOM operations
 * - Enhanced event type options
 * - Phone number formatting
 * - Fixed modal minimization after submission
 * - Fixed multiple overlay issue
 * - Fixed contact button appearance after submission
 */
(function() {
  'use strict';
  
  // State management
  const modalState = {
    isMinimized: true, // Start minimized
    isAnimating: false,
    formData: {},
    initialized: false // Track if elements are already created
  };
  
  // DOM references
  let contactModal;
  let contactModalOverlay;
  let successModal;
  let errorModal;
  
  // Initialize on DOM ready
  if (document.readyState !== 'loading') {
    window.requestAnimationFrame(init);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      window.requestAnimationFrame(init);
    });
  }
  
  function init() {
    // Only create elements if they don't exist yet
    if (!modalState.initialized) {
      createModalElements();
      setupEventListeners();
      modalState.initialized = true;
    }
    
    // Expose methods for external use
    window.FormModalHandler = {
      showSuccess,
      showError,
      minimize: minimizeModal,
      maximize: maximizeModal,
      toggle: toggleModalState,
      initFormEffects: window.FormModalHandler ? window.FormModalHandler.initFormEffects : null,
      resetModal: resetContactModal // Add new reset method
    };
  }
  
  function createModalElements() {
    // Clean up any existing elements first to prevent duplication
    removeExistingModals();
    
    // Create overlay
    contactModalOverlay = document.createElement('div');
    contactModalOverlay.className = 'modal-overlay';
    contactModalOverlay.id = 'contact-modal-overlay'; // Add ID for easier selection
    document.body.appendChild(contactModalOverlay);
    
    // Create contact modal in minimized state
    contactModal = document.createElement('div');
    contactModal.className = 'modal minimized';
    contactModal.id = 'contact-modal';
    contactModal.setAttribute('role', 'dialog');
    contactModal.setAttribute('aria-labelledby', 'modal-title');
    contactModal.style.display = 'block'; // Ensure visibility
    
    // Modal header and body
    contactModal.innerHTML = `
      <div class="modal-header">
        <h3 id="modal-title" class="modal-title">Contact Us</h3>
        <div class="modal-controls">
          <button type="button" class="minimize-modal" aria-label="Toggle form" title="Maximize form">
            <i class="fas fa-chevron-up"></i>
          </button>
        </div>
      </div>
      <div class="modal-body">
        <form id="modal-contact-form" class="modal-form" novalidate>
          <input type="hidden" name="time" id="form_time" value="${new Date().toLocaleString('en-US')}">
          
          <!-- Row 1: Name + Email (both required) -->
          <div class="form-row">
            <div class="form-group">
              <label for="name">Full Name <span class="required">*</span></label>
              <input type="text" id="name" name="name" required autocomplete="name">
            </div>
            <div class="form-group">
              <label for="email">Email Address <span class="required">*</span></label>
              <input type="email" id="email" name="email" required autocomplete="email">
            </div>
          </div>
          
          <!-- Row 2: Phone + Guest Count -->
          <div class="form-row">
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" autocomplete="tel" data-format-type="phone">
            </div>
            <div class="form-group">
              <label for="guests">Guest Count</label>
              <input type="number" id="guests" name="guests" min="1" inputmode="numeric" data-format-type="number">
            </div>
          </div>
          
          <!-- Row 3: Event Date + Event Type -->
          <div class="form-row">
            <div class="form-group">
              <label for="event-date">Preferred Event Date</label>
              <input type="date" id="event-date" name="event-date">
            </div>
            <div class="form-group">
              <label for="event-type">Event Type</label>
              <select id="event-type" name="event-type">
                <option value="" selected disabled>Select event type...</option>
                <option value="wedding">Wedding</option>
                <option value="quinceanera">Quinceañera</option>
                <option value="baptism">Baptism</option>
                <option value="first-communion">First Communion</option>
                <option value="confirmation">Confirmation Party</option>
                <option value="birthday">Birthday Party</option>
                <option value="anniversary">Anniversary</option>
                <option value="graduation">Graduation</option>
                <option value="engagement">Engagement Party</option>
                <option value="bridal-shower">Bridal Shower</option>
                <option value="baby-shower">Baby Shower</option>
                <option value="corporate">Corporate Event</option>
                <option value="memorial">Memorial Service</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <!-- Row 4: Message (full width) -->
          <div class="form-group full-width">
            <label for="message">Message <span class="required">*</span></label>
            <textarea id="message" name="message" required rows="4"></textarea>
          </div>
          
          <!-- Button row with Submit and Reset -->
          <div class="button-row">
            <button type="button" class="reset-button" id="form-reset">Start Over</button>
            <button type="submit" class="submit-button">Submit Inquiry</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(contactModal);
    
    // Create success modal
    successModal = document.createElement('div');
    successModal.className = 'feedback-modal';
    successModal.id = 'success-modal';
    successModal.innerHTML = `
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h3>Thank You!</h3>
      <p>Your message has been sent successfully. A member of our team will be in touch with you shortly.</p>
      <button type="button" class="btn btn-primary close-feedback">Close</button>
    `;
    document.body.appendChild(successModal);
    
    // Create error modal
    errorModal = document.createElement('div');
    errorModal.className = 'feedback-modal';
    errorModal.id = 'error-modal';
    errorModal.innerHTML = `
      <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h3>Submission Error</h3>
      <p id="error-message">There was a problem sending your message. Please try again.</p>
      <button type="button" class="btn btn-primary close-feedback">Close</button>
    `;
    document.body.appendChild(errorModal);
    
    console.log('Modal elements created');
  }
  
  // Helper function to remove any existing modal elements to prevent duplication
  function removeExistingModals() {
    const existingOverlay = document.getElementById('contact-modal-overlay');
    if (existingOverlay) {
      existingOverlay.parentNode.removeChild(existingOverlay);
    }
    
    const existingContactModal = document.getElementById('contact-modal');
    if (existingContactModal) {
      existingContactModal.parentNode.removeChild(existingContactModal);
    }
    
    const existingSuccessModal = document.getElementById('success-modal');
    if (existingSuccessModal) {
      existingSuccessModal.parentNode.removeChild(existingSuccessModal);
    }
    
    const existingErrorModal = document.getElementById('error-modal');
    if (existingErrorModal) {
      existingErrorModal.parentNode.removeChild(existingErrorModal);
    }
  }
  
  // New function: completely recreate the modal from scratch after submission
  function resetContactModal() {
    console.log('Resetting contact modal completely');
    // Remove the existing modal completely
    removeExistingModals();
    modalState.initialized = false;
    
    // Reset all state
    modalState.isMinimized = true;
    modalState.isAnimating = false;
    modalState.formData = {};
    
    // Re-initialize everything
    createModalElements();
    setupEventListeners();
    modalState.initialized = true;
    
    console.log('Contact modal reset completed');
  }
  
  function setupEventListeners() {
    // Use event delegation for better performance
    // Remove any existing handlers first
    document.removeEventListener('click', globalClickHandler);
    document.addEventListener('click', globalClickHandler);
    
    // Form submission handler - use once to prevent duplicate handlers
    const form = document.getElementById('modal-contact-form');
    if (form) {
      // Remove any existing handlers first
      form.removeEventListener('submit', handleFormSubmit);
      
      // Add the handler
      form.addEventListener('submit', handleFormSubmit);
      
      // Track form changes for persistence
      form.addEventListener('input', function(e) {
        if (e.target.name) {
          modalState.formData[e.target.name] = e.target.value;
        }
      });
    }
  }
  
  // Global click handler as a named function so it can be removed if needed
  function globalClickHandler(e) {
    // Handle contact buttons
    if (e.target.closest('.btn-contact')) {
      e.preventDefault();
      maximizeModal();
    }
    
    // Toggle minimized state
    if (e.target.closest('.minimize-modal')) {
      toggleModalState();
    }
    
    // Close when clicking overlay
    if (e.target === contactModalOverlay) {
      minimizeModal();
    }
    
    // Close feedback modals
    if (e.target.closest('.close-feedback')) {
      closeFeedbackModal();
    }
    
    // Reset form button
    if (e.target.closest('#form-reset')) {
      clearForm();
    }
  }
  
  function toggleModalState() {
    if (modalState.isAnimating) {
      return;
    }
    
    if (modalState.isMinimized) {
      maximizeModal();
    } else {
      minimizeModal();
    }
  }
  
  function minimizeModal() {
    if (modalState.isAnimating || !contactModal) return;
    modalState.isAnimating = true;
    
    // Update classes
    contactModal.classList.add('minimized');
    contactModal.classList.remove('active');
    
    // Make sure overlay is handled properly
    if (contactModalOverlay) {
      contactModalOverlay.classList.remove('active');
    }
    
    // Update icon direction
    const icon = contactModal.querySelector('.minimize-modal i');
    if (icon) {
      icon.className = 'fas fa-chevron-up';
      const button = icon.closest('button');
      if (button) button.title = 'Maximize form';
    }
    
    // Update state
    modalState.isMinimized = true;
    
    // Animation complete
    setTimeout(() => {
      modalState.isAnimating = false;
    }, 400);
  }
  
  function maximizeModal() {
    // Ensure we have modal elements
    if (!contactModal || !contactModalOverlay) {
      if (!modalState.initialized) {
        createModalElements();
        setupEventListeners();
        modalState.initialized = true;
      } else {
        console.error('Modal elements missing but initialized state is true');
        // Try to fix it by recreating the elements
        resetContactModal();
        return;
      }
    }
    
    if (modalState.isAnimating) return;
    modalState.isAnimating = true;
    
    // Critical - first add active class before removing minimized
    contactModalOverlay.classList.add('active');
    contactModal.classList.add('active');
    
    // Force a reflow to ensure active class is applied before removing minimized
    contactModal.offsetHeight;
    
    // Remove minimized class to start animation
    contactModal.classList.remove('minimized');
    
    // Update icon direction
    const icon = contactModal.querySelector('.minimize-modal i');
    if (icon) {
      icon.className = 'fas fa-minus';
      const button = icon.closest('button');
      if (button) button.title = 'Minimize form';
    }
    
    // Update state
    modalState.isMinimized = false;
    
    // Restore saved form data
    restoreFormData();
    
    // Animation complete
    setTimeout(() => {
      modalState.isAnimating = false;
      
      // Focus first input field
      const firstInput = contactModal.querySelector('input[name="name"]');
      if (firstInput) firstInput.focus();
      
      // Initialize form validation if needed
      if (window.FormValidator && typeof window.FormValidator.initializeFormFields === 'function') {
        window.FormValidator.initializeFormFields();
      }
    }, 400);
  }
  
  function restoreFormData() {
    const form = document.getElementById('modal-contact-form');
    if (!form || Object.keys(modalState.formData).length === 0) return;
    
    Object.entries(modalState.formData).forEach(([name, value]) => {
      const input = form.elements[name];
      if (input && name !== 'time') {
        input.value = value;
        
        // Format phone number if needed
        if (name === 'phone' && window.FormValidator) {
          input.value = window.FormValidator.formatPhoneNumber(value);
        }
      }
    });
  }
  
  function clearForm() {
    const form = document.getElementById('modal-contact-form');
    if (!form) return;
    
    // Reset form fields
    form.reset();
    
    // Clear saved data
    modalState.formData = {};
    
    // Reset validation errors
    const errorElements = form.querySelectorAll('.has-error');
    errorElements.forEach(el => el.classList.remove('has-error'));
    
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
    
    // Reset timestamp
    const timeField = document.getElementById('form_time');
    if (timeField) timeField.value = new Date().toLocaleString('en-US');
    
    // Focus on first field
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.focus();
  }
  
  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(this)) return;
    
    const form = e.target;
    
    // The actual form submission is handled by form-handler.js
    // Set up UI state for submission
    const submitBtn = form.querySelector('.submit-button');
    const resetBtn = form.querySelector('.reset-button');
    const originalContent = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    resetBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
    
    // Dispatch a custom event that form-handler.js will listen for
    const submissionEvent = new CustomEvent('handle-form-submit', { 
      bubbles: true,
      detail: { 
        form,
        onSuccess: (response) => {
          console.log('Success callback triggered', response);
          
          // First reset the form
          clearForm();
          
          // Completely reset and recreate the modal to ensure clean state
          setTimeout(() => {
            resetContactModal();
            
            // Then show success modal
            showSuccess();
            
            // Reset button states - just in case, though they'll be recreated
            if (!submitBtn.parentNode) return; // Check if element still exists
            submitBtn.disabled = false;
            resetBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
          }, 100);
        },
        onError: (error) => {
          console.error('EmailJS error:', error);
          showError('There was a problem sending your message. Please try again or contact us directly at (480) 123-4567.');
          
          // Reset button states
          submitBtn.disabled = false;
          resetBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
        }
      }
    });
    
    form.dispatchEvent(submissionEvent);
  }
  
  function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Clear previous errors
    const errorElements = form.querySelectorAll('.has-error');
    errorElements.forEach(el => el.classList.remove('has-error'));
    
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
    
    // Check each required field
    requiredFields.forEach(field => {
      const fieldGroup = field.closest('.form-group');
      
      if (!field.value.trim()) {
        fieldGroup.classList.add('has-error');
        isValid = false;
        
        // Add error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'This field is required';
        fieldGroup.appendChild(errorMsg);
      } else if (field.type === 'email' && !validateEmail(field.value)) {
        fieldGroup.classList.add('has-error');
        isValid = false;
        
        // Add error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Please enter a valid email address';
        fieldGroup.appendChild(errorMsg);
      }
    });
    
    // Focus first error field if validation failed
    if (!isValid) {
      const firstErrorField = form.querySelector('.has-error input, .has-error textarea, .has-error select');
      if (firstErrorField) firstErrorField.focus();
    }
    
    return isValid;
  }
  
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function showSuccess() {
    // Important: First minimize the contact modal, then show success
    if (contactModal && !modalState.isMinimized) {
      minimizeModal();
    }
    
    // Show the success modal
    if (successModal) {
      successModal.classList.add('active');
    }
    
    if (contactModalOverlay) {
      contactModalOverlay.classList.add('active');
    }
  }
  
  function showError(message) {
    // Set error message
    const errorMessageEl = document.getElementById('error-message');
    if (errorMessageEl) {
      errorMessageEl.textContent = message || 'There was a problem sending your message. Please try again.';
    }
    
    if (errorModal) {
      errorModal.classList.add('active');
    }
    
    if (contactModalOverlay) {
      contactModalOverlay.classList.add('active');
    }
  }
  
  function closeFeedbackModal() {
    if (successModal) {
      successModal.classList.remove('active');
    }
    
    if (errorModal) {
      errorModal.classList.remove('active');
    }
    
    if (contactModalOverlay) {
      contactModalOverlay.classList.remove('active');
    }
  }
})();