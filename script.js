document.addEventListener('DOMContentLoaded', function() {
    const leadForm = document.getElementById('lead-form');
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

    leadForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way
        
        if (!validateStep(currentStep)) {
            return;
        }

        // --- EmailJS Integration ---
        // Replace with your actual EmailJS IDs
        const serviceID = 'service_j1y9z7f'; // Replace with your actual Service ID
        const templateID = 'template_x8y5z9a'; // Replace with your actual Template ID
        const publicKey = 'YOUR_PUBLIC_KEY'; // This is your PUBLIC key from EmailJS account

        // Show a "sending" message
        formMessage.textContent = 'Sending your request...';
        formMessage.style.color = '#FBBF24'; // Amber color

        emailjs.sendForm(serviceID, templateID, this, publicKey)
            .then(() => {
                // Success
                formMessage.textContent = 'Thank you! We have received your request and will get back to you shortly.';
                formMessage.style.color = '#22C55E'; // Green color for success
                leadForm.style.display = 'none'; // Hide form on success

                // Optional: Reset form after a delay
                setTimeout(() => {
                    window.location.reload(); // Reload the page to reset everything
                }, 5000);
            }, (err) => {
                // Error
                formMessage.textContent = 'Sorry, something went wrong. Please try again.';
                formMessage.style.color = '#F87171'; // Error color
                alert(JSON.stringify(err));
            });
    });

    // Show the initial step
    showStep(currentStep);

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
});
