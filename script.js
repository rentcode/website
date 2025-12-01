document.addEventListener('DOMContentLoaded', function() {
    const leadForm = document.getElementById('lead-form');
    const userTypeSelection = document.querySelector('.user-type-selection');
    const searchSection = document.querySelector('.search-section');
    const selectTenantBtn = document.getElementById('select-tenant');
    const selectLandlordBtn = document.getElementById('select-landlord');
    const formMessage = document.getElementById('form-message');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.next-button');
    const prevButtons = document.querySelectorAll('.prev-button');
    let currentStep = 0;
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    function showStep(stepIndex) {
        const previousStep = steps.findIndex(step => step.classList.contains('active-step'));
        steps.forEach((step, index) => {
            step.classList.remove('active-step', 'slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
            if (index === stepIndex) {
                step.classList.add('active-step');
                if (previousStep < stepIndex) {
                    step.classList.add('slide-in-right');
                } else {
                    step.classList.add('slide-in-left');
                }
            }
        });
        // Update progress bar
        const progressPercentage = (stepIndex / (steps.length - 1)) * 100;
        progressBarFill.style.width = `${progressPercentage}%`;

        // Update progress steps
        progressSteps.forEach((step, index) => {
            if (index <= stepIndex) step.classList.add('active');
            else step.classList.remove('active');
        });
    }

    function validateStep(stepIndex) {
        const activeStep = steps[stepIndex];
        const inputs = activeStep.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        for (const input of inputs) {
            const inputGroup = input.closest('.input-group');
            const errorSpan = inputGroup ? inputGroup.querySelector('.error-message') : null;
            if (!input.value) {
                input.classList.add('invalid');
                if(errorSpan) errorSpan.textContent = 'This field is required.';
                isValid = false;
            } else {
                input.classList.remove('invalid');
                if(errorSpan) errorSpan.textContent = '';
            }
        }
        return true;
    }

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep) && currentStep < steps.length - 1) {
                steps[currentStep].classList.add('slide-out-left');
                currentStep++;
                setTimeout(() => {
                    showStep(currentStep);
                }, 300); // Match animation duration
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                steps[currentStep].classList.add('slide-out-right');
                currentStep--;
                setTimeout(() => {
                    showStep(currentStep);
                }, 300); // Match animation duration
            }
        });
    });

    function sendDataViaEmailJS(formDataObject) {
        // Show a "sending" message
        formMessage.textContent = 'Sending your request...';
        formMessage.style.color = '#FBBF24'; // Amber color
        formMessage.style.display = 'block';
        leadForm.style.display = 'none'; // Hide form while sending

        // --- EmailJS Integration ---
        const serviceID = 'service_j1y9z7f'; // Replace with your actual Service ID
        const templateID = 'template_x8y5z9a'; // Replace with your actual Template ID
        const publicKey = 'YOUR_PUBLIC_KEY'; // This is your PUBLIC key from EmailJS account

        emailjs.send(serviceID, templateID, formDataObject, publicKey)
            .then(() => {
                // Success
                formMessage.textContent = 'Thank you! We have received your request and will get back to you shortly.';
                formMessage.style.color = '#22C55E'; // Green color for success
                sessionStorage.removeItem('formData'); // Clean up stored data

                // Optional: Reset form after a delay
                setTimeout(() => {
                    window.location.href = window.location.pathname; // Reload page without query params
                }, 5000);
            }, (err) => {
                // Error
                formMessage.textContent = 'Sorry, something went wrong while sending your data. Please contact us directly.';
                formMessage.style.color = '#F87171'; // Error color
                alert(JSON.stringify(err));
                sessionStorage.removeItem('formData'); // Clean up stored data
            });
    }

    function handlePayment(paymentMethod) {
        if (!validateStep(currentStep)) {
            return;
        }

        // 1. Save form data to sessionStorage before redirecting
        const formData = new FormData(leadForm);
        const formDataObject = Object.fromEntries(formData.entries());
        sessionStorage.setItem('formData', JSON.stringify(formDataObject));

        // --- Payment Details ---
        const amount = '30.00';
        const currency = 'USD';
        const subject = `Application Fee (${formDataObject.user_type})`;
        const transactionId = 'RENTCODE-' + Date.now(); // Simple unique ID
        const returnUrlBase = window.location.origin + window.location.pathname;

        if (paymentMethod === 'skrill') {
            // --- Skrill Redirect ---
            const skrillPayUrl = 'https://pay.skrill.com/';
            const recipientEmail = 'your-skrill-email@example.com'; // IMPORTANT: Replace with your Skrill account email

            const params = new URLSearchParams({
                pay_to_email: recipientEmail,
                amount: amount,
                currency: currency,
                transaction_id: transactionId,
                return_url: `${returnUrlBase}?payment=success`,
                cancel_url: `${returnUrlBase}?payment=cancelled`,
                status_url: `mailto:${recipientEmail}`, // Optional: Get an email for each payment
                detail1_description: subject,
                detail1_text: `Payment for ${formDataObject.name || 'Application'}`
            });
            window.location.href = `${skrillPayUrl}?${params.toString()}`;

        } else if (paymentMethod === 'paypal') {
            // --- PayPal Redirect ---
            const paypalUrl = 'https://www.paypal.com/cgi-bin/webscr';
            const recipientEmail = 'your-paypal-email@example.com'; // IMPORTANT: Replace with your PayPal account email

            const params = new URLSearchParams({
                cmd: '_xclick',
                business: recipientEmail,
                item_name: subject,
                item_number: transactionId,
                amount: amount,
                currency_code: currency,
                return: `${returnUrlBase}?payment=success`,
                cancel_return: `${returnUrlBase}?payment=cancelled`,
                notify_url: '' // Optional: For server-side IPN
            });
            window.location.href = `${paypalUrl}?${params.toString()}`;
        }
    }

    // Add event listeners for the new payment buttons
    document.getElementById('pay-skrill').addEventListener('click', () => handlePayment('skrill'));
    document.getElementById('pay-paypal').addEventListener('click', () => handlePayment('paypal'));

    // --- Role Selection Logic ---
    function initializeFormForRole(role) {
        // 1. Set hidden input value
        document.getElementById('user_type').value = role;

        // 2. Update form titles and text
        const formIntro = searchSection.querySelector('.form-intro');
        const introTitle = formIntro.querySelector('h2');
        const introP = formIntro.querySelector('p');
        const step2Title = steps[1].querySelector('h3');
        
        // Get all role-specific fields
        const tenantFields = document.querySelectorAll('.tenant-field');
        const landlordFields = document.querySelectorAll('.landlord-field');

        if (role === 'Landlord') {
            introTitle.textContent = "List Your Property With Us";
            introP.textContent = "Fill out the form below to find qualified tenants for your property.";
            step2Title.textContent = "Property Details";

            // Show landlord fields and make them required
            landlordFields.forEach(field => {
                field.style.display = 'block';
                const input = field.querySelector('input, select');
                if (input) input.required = true;
            });

            // Hide tenant fields and make them not required
            tenantFields.forEach(field => {
                field.style.display = 'none';
                const input = field.querySelector('input, select');
                if (input) input.required = false;
            });

        } else { // Tenant (default)
            introTitle.textContent = "Find Your Next Home";
            introP.textContent = "Let's find the perfect rental for you. Complete the steps below to get started.";
            step2Title.textContent = "Rental Preferences";

            // Show tenant fields and make them required
            tenantFields.forEach(field => {
                field.style.display = 'block';
                const input = field.querySelector('input, select');
                if (input) input.required = true;
            });

            // Hide landlord fields and make them not required
            landlordFields.forEach(field => {
                field.style.display = 'none';
                const input = field.querySelector('input, select');
                if (input) input.required = false;
            });
        }

        // 3. Show the form and hide the selection screen
        userTypeSelection.style.display = 'none';
        searchSection.style.display = 'flex';

        // 4. Initialize the first step of the form
        showStep(0);
    }

    selectTenantBtn.addEventListener('click', () => initializeFormForRole('Tenant'));
    selectLandlordBtn.addEventListener('click', () => initializeFormForRole('Landlord'));


    // Hamburger Menu Logic
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Handle Return from Skrill ---
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const storedFormData = sessionStorage.getItem('formData');

    if (paymentStatus === 'success' && storedFormData) {
        const formDataObject = JSON.parse(storedFormData);
        sendDataViaEmailJS(formDataObject);
    } else if (paymentStatus === 'cancelled') {
        formMessage.textContent = 'Your payment was cancelled. You can try submitting again.';
        formMessage.style.color = '#FBBF24'; // Amber color
        formMessage.style.display = 'block';
        setTimeout(() => {
             window.location.href = window.location.pathname; // Clean URL
        }, 5000);
    }

    // --- Custom Select Dropdown Logic ---
    function initializeCustomSelects() {
        const wrappers = document.querySelectorAll('.custom-select-wrapper');
        
        wrappers.forEach(wrapper => {
            const originalSelect = wrapper.querySelector('select');
            if (!originalSelect || wrapper.querySelector('.select-selected')) {
                // Already initialized or no select found
                return;
            }

            // Create the "selected" box
            const selectedDiv = document.createElement('div');
            selectedDiv.classList.add('select-selected');
            selectedDiv.innerHTML = originalSelect.options[originalSelect.selectedIndex].innerHTML;
            wrapper.appendChild(selectedDiv);

            // Create the options container
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('select-items', 'select-hide');

            // Create and append each option
            Array.from(originalSelect.options).forEach((option, index) => {
                if (index === 0) return; // Skip placeholder
                const optionDiv = document.createElement('div');
                optionDiv.innerHTML = option.innerHTML;
                
                optionDiv.addEventListener('click', function() {
                    // Update original select
                    originalSelect.value = option.value;
                    originalSelect.selectedIndex = index;

                    // Update selected div
                    selectedDiv.innerHTML = this.innerHTML;

                    // Mark the selected option in the list
                    const sameAsSelected = optionsDiv.querySelector('.same-as-selected');
                    if (sameAsSelected) {
                        sameAsSelected.classList.remove('same-as-selected');
                    }
                    this.classList.add('same-as-selected');

                    // Trigger change event for any other listeners and for validation
                    originalSelect.dispatchEvent(new Event('change'));

                    closeAllSelects();
                });
                optionsDiv.appendChild(optionDiv);
            });

            wrapper.appendChild(optionsDiv);

            selectedDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                closeAllSelects(this);
                this.nextSibling.classList.toggle('select-hide');
                this.classList.toggle('select-arrow-active');
            });
        });
    }

    function closeAllSelects(exceptThis) {
        const items = document.querySelectorAll('.select-items');
        const selected = document.querySelectorAll('.select-selected');

        selected.forEach((sel, i) => {
            if (sel !== exceptThis) {
                sel.classList.remove('select-arrow-active');
                items[i].classList.add('select-hide');
            }
        });
    }

    // Close dropdowns if user clicks outside
    document.addEventListener('click', closeAllSelects);

    // Initialize the custom selects on page load
    initializeCustomSelects();

    // Re-initialize if new selects are added dynamically (optional but good practice)
    // For example, if you were to load form steps via AJAX.
    // For this multi-step form, we can re-check on step change.
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active-step')) {
                    initializeCustomSelects();
                }
            }
        }
    });
    steps.forEach(step => observer.observe(step, { attributes: true }));
});
