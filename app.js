document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll behavior for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add hover effects for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.transition = 'transform 0.2s ease';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.transform = 'translateY(0)';
        });
    });

    // Add animated counter for statistics
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Animate mission stats when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate numbers if they exist
                const valueElement = entry.target.querySelector('.stat-value');
                if (valueElement) {
                    const value = parseFloat(valueElement.textContent);
                    if (!isNaN(value)) {
                        animateValue(valueElement, 0, value, 1000);
                    }
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe all stat items and metric cards
    document.querySelectorAll('.stat-item, .metric-card').forEach(item => {
        observer.observe(item);
    });

    // Add parallax effect to tracking section
    const trackingSection = document.querySelector('.tracking-section');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        trackingSection.style.backgroundPositionY = scrolled * 0.5 + 'px';
    });

    // Add real-time update simulation for mission data
    setInterval(() => {
        document.querySelectorAll('.mission-card').forEach(card => {
            const latitude = card.querySelector('.stat-value');
            if (latitude) {
                const currentValue = parseFloat(latitude.textContent);
                const newValue = (currentValue + (Math.random() * 0.001)).toFixed(4);
                latitude.textContent = newValue + '°';
                
                // Add subtle highlight effect
                latitude.style.color = '#4285f4';
                setTimeout(() => {
                    latitude.style.color = '';
                }, 500);
            }
        });
    }, 3000);

    // Add typing effect to the main title
    const title = document.querySelector('h1');
    if (title) {
        const originalText = "Discovering Space ";
        const highlightText = "For all Mandkind ✨";
        title.innerHTML = '';
        let i = 0;
        let isTypingHighlight = false;
        
        function typeWriter() {
            if (!isTypingHighlight && i < originalText.length) {
                title.innerHTML += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else if (!isTypingHighlight && i >= originalText.length) {
                isTypingHighlight = true;
                title.innerHTML += `<span class="highlight">`;
                i = 0;
                setTimeout(typeWriter, 50);
            } else if (isTypingHighlight && i < highlightText.length) {
                const highlight = title.querySelector('.highlight');
                highlight.textContent += highlightText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        typeWriter();
    }

    // Add particle background effect
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.5';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = 'rgba(66, 133, 244, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
    });
}); 
