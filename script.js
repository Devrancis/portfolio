const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
}

// Navigators
const container = document.querySelector('.container');
const navLinks = document.querySelectorAll('.nav-link');
const navIndicator = document.querySelector('.nav-indicator');

const sections = ['home', 'services', 'portfolio', 'experience', 'contact'];

// Gotta initialize current section index
let currentSectionIndex = 0;
let scrollCooldown = false;
let lastScrollTime = 0;

function switchSection(section) {
    container.className = `container showing-${section}`;
    currentSectionIndex = sections.indexOf(section);

    navLinks.forEach((link, index) => {
        link.classList.toggle('active', link.dataset.section === section);
        if (link.dataset.section === section) {
            navIndicator.style.top = `${index * 80}px`;
        }
    });

    const sectionIndex = sections.indexOf(section);
    pageIndicator.textContent = `0${sectionIndex + 1}`;
    
    // Reset scroll position of the new section and ensure it's ready for scrolling)
    const activeSection = document.querySelector(`.${section}`);
    if (activeSection) {
        // Use setTimeout to ensure scroll reset happens after transition
        setTimeout(() => {
            activeSection.scrollTop = 0;
            // Reset scroll cooldown when manually navigating to allow immediate scrolling
            scrollCooldown = false;
            lastScrollTime = 0;
            scrollIntentDelta = 0; // Reset scroll intent when manually navigating
            // Re-setup scroll listeners to ensure they work after navigation
            setupScrollListeners();
        }, 150);
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        switchSection(link.dataset.section);
    });
});

document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', (e) => {
        const section = el.dataset.section;
        if (section && el.tagName === 'BUTTON') {
            switchSection(section);
        }
    });
});

// Typing Effect for Name, it's plentyyy
const typingElement = document.getElementById('typing-name');
const names = ['Francis Iyiola', 'Devrancis'];
let nameIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const currentName = names[nameIndex];

    if (!isDeleting && charIndex <= currentName.length) {
        typingElement.textContent = currentName.substring(0, charIndex);
        charIndex++;
    } else if (isDeleting && charIndex >= 0) {
        typingElement.textContent = currentName.substring(0, charIndex);
        charIndex--;
    }

    if (charIndex === currentName.length + 1) {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
    }

    if (isDeleting && charIndex === 0) {
        isDeleting = false;
        nameIndex = (nameIndex + 1) % names.length;
    }

    setTimeout(type, isDeleting ? 50 : 150);
}

type();

// Crypto Price Ticker
async function fetchCrypto() {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,dogecoin,polkadot&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();

        const coins = [
            { symbol: 'BTC', price: data.bitcoin?.usd, change: data.bitcoin?.usd_24h_change },
            { symbol: 'ETH', price: data.ethereum?.usd, change: data.ethereum?.usd_24h_change },
            { symbol: 'SOL', price: data.solana?.usd, change: data.solana?.usd_24h_change },
            { symbol: 'ADA', price: data.cardano?.usd, change: data.cardano?.usd_24h_change },
            { symbol: 'DOGE', price: data.dogecoin?.usd, change: data.dogecoin?.usd_24h_change },
            { symbol: 'DOT', price: data.polkadot?.usd, change: data.polkadot?.usd_24h_change },
        ];

        // Duplicate coins for seamless infinite scroll
        const duplicated = [...coins, ...coins];

        const cryptoTrack = document.getElementById('crypto-track');
        cryptoTrack.innerHTML = duplicated.map(coin => `
            <div class="crypto-coin">
                <div class="crypto-symbol">${coin.symbol}</div>
                <div class="crypto-price">${coin.price ? coin.price.toLocaleString() : '0.00'}</div>
                <div class="crypto-change ${coin.change >= 0 ? 'positive' : 'negative'}">
                    ${coin.change >= 0 ? '↑' : '↓'} ${Math.abs(coin.change).toFixed(2)}%
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch crypto data:', error);
    }
}

// Fetch crypto prices on load and refresh every minute
fetchCrypto();
setInterval(fetchCrypto, 60000);

// Portfolio Filter System
const filterTabs = document.querySelectorAll('.filter-tab');
const projectCards = document.querySelectorAll('.project-card');

// Animated filter I just gotta be careful with these numbers
const FILTER_EXIT_MS = 300;
const FILTER_ENTER_MS = 500;

function setCardVisible(card, visible, orderIndex = 0) {
    // clear per-filter classes
    card.classList.remove('project-exit', 'project-enter');
    card.style.removeProperty('--stagger');

    if (visible) {
        card.style.display = 'block';
        card.style.setProperty('--stagger', String(orderIndex));
        card.offsetHeight;
        card.classList.add('project-enter');
    } else {
        card.classList.add('project-exit');
        window.setTimeout(() => {
            card.style.display = 'none';
            card.classList.remove('project-exit');
        }, FILTER_EXIT_MS);
    }
}

function applyPortfolioFilter(filter) {
    // Scroll to top of portfolio section smoothly 
    const portfolioSection = document.querySelector('.portfolio');
    if (portfolioSection) {
        portfolioSection.scrollTo({ top: 0, behavior: 'smooth' });
    }

    let enterIndex = 0;
    projectCards.forEach(card => {
        const shouldShow = filter === 'all' || card.dataset.type === filter;
        if (shouldShow) {
            setCardVisible(card, true, enterIndex++);
        } else {
            // Only animate exit if it is currently visible
            if (card.style.display === 'none') return;
            setCardVisible(card, false);
        }
    });

    // Clean up enter classes after animation completes (keeps hover transforms behaving nicely)
    window.setTimeout(() => {
        projectCards.forEach(card => card.classList.remove('project-enter'));
    }, FILTER_ENTER_MS + 200);
}

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        // Update active tab
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        applyPortfolioFilter(filter);
    });
});

// Smooth Scroll Navigation - Only between Home and Services
const scrollCooldownDuration = 1000;

// Track scroll intent for more deliberate section switching
let scrollIntentDelta = 0;
const scrollIntentThreshold = 100;

function handleWheelScroll(e) {
    // Only allow scroll navigation between home (index 0) and services (index 1)
    const homeIndex = 0;
    const servicesIndex = 1;
    
    // Only enable scroll navigation if we're on home or services page
    if (currentSectionIndex !== homeIndex && currentSectionIndex !== servicesIndex) {
        return; // Allow normal scrolling on other sections
    }
    
    const currentSection = document.querySelector(`.${sections[currentSectionIndex]}`);
    if (!currentSection) return;
    
    const scrollTop = currentSection.scrollTop;
    const scrollHeight = currentSection.scrollHeight;
    const clientHeight = currentSection.clientHeight;
    const hasScrollableContent = scrollHeight > clientHeight;
    
    const isAtTop = scrollTop <= 5;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
    
    if (currentSectionIndex === homeIndex && e.deltaY > 0) {
        if (isAtBottom || !hasScrollableContent) {
            // Accumulate scroll intent
            if (scrollIntentDelta < 0) scrollIntentDelta = 0; // Reset if direction changed
            scrollIntentDelta += Math.abs(e.deltaY);
            
            // Only switch if we've accumulated enough scroll intent
            if (scrollIntentDelta >= scrollIntentThreshold) {
                const timeSinceLastScroll = Date.now() - lastScrollTime;
                if (timeSinceLastScroll > scrollCooldownDuration) {
                    e.preventDefault();
                    scrollCooldown = true;
                    scrollIntentDelta = 0;
                    lastScrollTime = Date.now();
                    currentSectionIndex = servicesIndex;
                    switchSection(sections[currentSectionIndex]);
                    setTimeout(() => {
                        scrollCooldown = false;
                    }, scrollCooldownDuration);
                }
                return;
            }
        } else {
            scrollIntentDelta = 0;
        }
    }
    
    if (currentSectionIndex === servicesIndex && e.deltaY < 0) {
        if (isAtTop || !hasScrollableContent) {
            if (scrollIntentDelta > 0) scrollIntentDelta = 0;
            scrollIntentDelta -= Math.abs(e.deltaY);
            
            if (Math.abs(scrollIntentDelta) >= scrollIntentThreshold) {
                const timeSinceLastScroll = Date.now() - lastScrollTime;
                if (timeSinceLastScroll > scrollCooldownDuration) {
                    e.preventDefault();
                    scrollCooldown = true;
                    scrollIntentDelta = 0; 
                    lastScrollTime = Date.now();
                    currentSectionIndex = homeIndex;
                    switchSection(sections[currentSectionIndex]);
                    setTimeout(() => {
                        scrollCooldown = false;
                    }, scrollCooldownDuration);
                }
                return;
            }
        } else {
            scrollIntentDelta = 0;
        }
    }
    
    if ((currentSectionIndex === homeIndex && e.deltaY < 0) || 
        (currentSectionIndex === servicesIndex && e.deltaY > 0)) {
        scrollIntentDelta = 0;
    }
    
    if (!isAtTop && !isAtBottom && hasScrollableContent) {
        scrollIntentDelta = 0;
    }
}

function setupScrollListeners() {
    const homeSection = document.querySelector('.home');
    const servicesSection = document.querySelector('.services');
    
    if (homeSection) {
        homeSection.removeEventListener('wheel', handleWheelScroll);
        homeSection.addEventListener('wheel', handleWheelScroll, { passive: false });
    }
    
    if (servicesSection) {
        servicesSection.removeEventListener('wheel', handleWheelScroll);
        servicesSection.addEventListener('wheel', handleWheelScroll, { passive: false });
    }
    
    container.removeEventListener('wheel', handleWheelScroll);
    container.addEventListener('wheel', handleWheelScroll, { passive: false });
}

setupScrollListeners();

console.log('Setting up theme switcher...');

const themeButtons = document.querySelectorAll('.theme-btn');
console.log('Found theme buttons:', themeButtons.length);

// Get initial theme
let currentTheme = localStorage.getItem('portfolio-theme') || 'green';
document.documentElement.setAttribute('data-theme', currentTheme);
console.log('Initial theme set to:', currentTheme);

// Update active button on load
themeButtons.forEach(btn => {
    const btnTheme = btn.getAttribute('data-theme');
    if (btnTheme === currentTheme) {
        btn.classList.add('active');
    }
});

// Add click handlers
themeButtons.forEach((btn, index) => {
    console.log(`Button ${index} theme:`, btn.getAttribute('data-theme'));

    btn.addEventListener('click', function() {
        const selectedTheme = this.getAttribute('data-theme');
        console.log('Theme button clicked! Selected:', selectedTheme);

        // Update HTML attribute
        document.documentElement.setAttribute('data-theme', selectedTheme);

        // Save to localStorage
        localStorage.setItem('portfolio-theme', selectedTheme);

        // Update button states
        themeButtons.forEach(b => {
            b.classList.remove('active');
        });
        this.classList.add('active');

        console.log('Theme changed to:', selectedTheme);
    });
});

const copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) {
    const currentYear = new Date().getFullYear();
    copyrightYear.textContent = currentYear;
}

// Mobile Contact Section Reordering
function reorderMobile() {
    const contactGrid = document.querySelector('.contact-grid');
    const contactInfo = document.querySelector('.contact-info');
    const contactMethods = document.querySelector('.contact-methods');
    const formWrapper = document.querySelector('.contact-grid > div:last-child');
    const copyright = document.querySelector('.copyright-footer');
    
    if (window.innerWidth <= 1024) {
        if (contactMethods && formWrapper && contactMethods.parentElement === contactInfo) {
            contactGrid.insertBefore(contactMethods, formWrapper.nextSibling);
        }
        
        if (copyright && contactMethods && copyright.parentElement !== contactGrid) {
            contactGrid.appendChild(copyright);
        }
    } else {
        if (contactMethods && contactInfo && contactMethods.parentElement === contactGrid) {
            contactInfo.appendChild(contactMethods);
        }
        
        if (copyright && formWrapper && copyright.parentElement === contactGrid) {
            formWrapper.appendChild(copyright);
        }
    }
}

reorderMobile();
window.addEventListener('resize', reorderMobile);

// Mobile Navigation
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileNavMenu = document.querySelector('.mobile-nav-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const mobileNavDots = document.querySelectorAll('.mobile-nav-dot');

// Toggle menu open/close
if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
        mobileNavToggle.classList.toggle('active');
        mobileNavMenu.classList.toggle('active');
    });
}

mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        
        mobileNavMenu.classList.remove('active');
        mobileNavToggle.classList.remove('active');
        
        switchSection(section);
        
        updateMobileNavDots(section);
    });
});

mobileNavDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const section = dot.dataset.section;
        switchSection(section);
        updateMobileNavDots(section);
    });
});

function updateMobileNavDots(section) {
    mobileNavDots.forEach(dot => {
        dot.classList.toggle('active', dot.dataset.section === section);
    });
}

mobileNavMenu.addEventListener('click', (e) => {
    if (e.target === mobileNavMenu) {
        mobileNavMenu.classList.remove('active');
        mobileNavToggle.classList.remove('active');
    }
});


const contactForm = document.getElementById('contact-form');

if (contactForm) {
    let formLoadTime = Date.now();
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonHTML = submitButton.innerHTML;
        
        const submissionTime = Date.now();
        const timeDiff = (submissionTime - formLoadTime) / 1000;
        
        if (timeDiff < 3) {
            console.warn('Potential bot detected: form submitted too quickly');
            showNotification('Please take your time filling out the form.', 'error');
            return;
        }
        
        const botcheck = this.querySelector('input[name="botcheck"]');
        const website = this.querySelector('input[name="website"]');
        const confirmEmail = this.querySelector('input[name="confirm_email"]');
        
        if (botcheck?.checked || website?.value || confirmEmail?.value) {
            console.warn('Potential bot detected: honeypot triggered');
            submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            setTimeout(() => {
                contactForm.reset();
                submitButton.innerHTML = originalButtonHTML;
            }, 2000);
            return;
        }
        
        const name = this.querySelector('input[name="name"]').value.trim();
        const email = this.querySelector('input[name="email"]').value.trim();
        const message = this.querySelector('textarea[name="message"]').value.trim();
        
        if (name.length < 2) {
            showNotification('Please enter a valid name.', 'error');
            return;
        }
        
        if (!email.includes('@') || email.length < 5) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        if (message.length < 10) {
            showNotification('Please write a message with at least 10 characters.', 'error');
            return;
        }
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            const formData = new FormData(contactForm);
            
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitButton.style.background = 'var(--accent)';
                
                contactForm.reset();
                formLoadTime = Date.now(); 
                
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                    submitButton.style.background = '';
                }, 3000);
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            
            submitButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            submitButton.style.background = '#FF4444';
            
            showNotification('Oops! Something went wrong. Please try again or email me directly at francisiyiola.fi@gmail.com', 'error');
            
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
                submitButton.style.background = '';
            }, 3000);
        }
    });
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}