const pickTheme = function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dr-theme', theme);
    
    document.querySelectorAll('.theme-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.theme === theme);
    });
    
    const picker = document.getElementById('themePicker');
    if (picker) {
        picker.style.opacity = '0';
        picker.style.transition = 'opacity .4s ease';
        
        // Unlock the body scroll once a theme is picked
        document.body.style.overflow = '';
        
        window.setTimeout(function() { picker.remove(); }, 400);
    }
};

// LOADER
var loader     = document.getElementById('loader');
var loaderFill = document.getElementById('loaderFill');
var loaderPct  = document.getElementById('loaderPct');
var pct = 0;

var loaderTick = setInterval(function() {
    pct += Math.random() * 8 + 2;
    
    if (pct >= 100) {
        pct = 100;
        clearInterval(loaderTick);
        loaderFill.style.width = '100%';
        loaderPct.textContent  = '100%';
        
        window.setTimeout(function() {
            // 1. Start fading out the loader immediately
            loader.classList.add('out');
            
            // 2. Remove the loader from the DOM after the fade animation
            window.setTimeout(function() {
                loader.style.display = 'none';
            }, 700);
            
        }, 350); // Small pause at 100% before transitioning
    }
    
    loaderFill.style.width = pct + '%';
    loaderPct.textContent  = Math.floor(pct) + '%';
}, 75);

// CUSTOM CURSOR
var dot  = document.getElementById('cursorDot');
var ring = document.getElementById('cursorRing');
var mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
});

(function animRing() {
    rx += (mx - rx) * .13;
    ry += (my - ry) * .13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
})();

var HOVER_SEL = 'a,button,.ftab,.proj-card,.svc-card,.cm,.ti,.soc,.theme-btn,.mob-link,.back-top,.pl';
document.addEventListener('mouseover', function(e) {
    if (e.target.closest(HOVER_SEL)) { ring.classList.add('hov'); dot.style.transform = 'translate(-50%,-50%) scale(1.5)'; }
});
document.addEventListener('mouseout', function(e) {
    if (e.target.closest(HOVER_SEL)) { ring.classList.remove('hov'); dot.style.transform = 'translate(-50%,-50%) scale(1)'; }
});
document.addEventListener('mouseleave', function() { dot.style.opacity = '0'; ring.style.opacity = '0'; });
document.addEventListener('mouseenter', function() { dot.style.opacity = '1'; ring.style.opacity = '.65'; });

// NAVBAR & SCROLL
var navbar    = document.getElementById('navbar');
var scrollBar = document.getElementById('scrollBar');
var backTop   = document.getElementById('backTop');

window.addEventListener('scroll', function() {
    var scrollY   = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress  = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    scrollBar.style.width = progress + '%';
    navbar.classList.toggle('scrolled', scrollY > 40);
    backTop.classList.toggle('visible', scrollY > 400);
    updateScrollSpy();
}, { passive: true });

backTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playClick();
});

// SCROLL SPY
var navLinks   = document.querySelectorAll('.nav-link');
var sectionIds = ['home','services','portfolio','experience','contact'];
var NAV_H      = 64;

function updateScrollSpy() {
    var current = sectionIds[0];
    sectionIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (window.scrollY >= el.offsetTop - NAV_H - 60) current = id;
    });
    navLinks.forEach(function(l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
}

// SMOOTH SCROLL
function smoothScrollTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - NAV_H + 2;
    window.scrollTo({ top: top, behavior: 'smooth' });
    playClick();
}

document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        e.preventDefault();
        smoothScrollTo(id);
        closeMobMenu();
    });
});

// MOBILE MENU 
var hamburger = document.getElementById('hamburger');
var mobMenu   = document.getElementById('mobMenu');
var mobClose  = document.getElementById('mobClose');

function openMobMenu()  { mobMenu.classList.add('open');    hamburger.classList.add('open'); }
function closeMobMenu() { mobMenu.classList.remove('open'); hamburger.classList.remove('open'); }

hamburger.addEventListener('click', function() {
    mobMenu.classList.contains('open') ? closeMobMenu() : openMobMenu();
});
mobClose.addEventListener('click', closeMobMenu);

document.querySelectorAll('.mob-link').forEach(function(l) {
    l.addEventListener('click', function(e) {
        e.preventDefault();
        var id = l.getAttribute('href').slice(1);
        closeMobMenu();
        window.setTimeout(function() { smoothScrollTo(id); }, 80);
    });
});

// THEME SWITCHER 
var themeBtns  = document.querySelectorAll('.theme-btn');
var savedTheme = localStorage.getItem('dr-theme') || 'green';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtns.forEach(function(b) {
    b.classList.toggle('active', b.dataset.theme === savedTheme);
    b.addEventListener('click', function() { pickTheme(b.dataset.theme); });
});

// TYPEWRITER
var typingEl = document.getElementById('typingName');
var words    = ['Francis Iyiola', 'An EnGineer'];
var wi = 0, ci = 0, del = false;

function type() {
    var w = words[wi];
    if (!del) {
        typingEl.textContent = w.substring(0, ci + 1);
        ci++;
        if (ci === w.length) { del = true; window.setTimeout(type, 2200); return; }
    } else {
        typingEl.textContent = w.substring(0, ci - 1);
        ci--;
        if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    window.setTimeout(type, del ? 45 : 130);
}
type();

// CRYPTO TICKER
function fetchCrypto() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,dogecoin,polkadot&vs_currencies=usd&include_24hr_change=true')
    .then(function(res) { return res.json(); })
    .then(function(data) {
        var coins = [
            { sym:'BTC',  p:data.bitcoin?.usd,   c:data.bitcoin?.usd_24h_change },
            { sym:'ETH',  p:data.ethereum?.usd,  c:data.ethereum?.usd_24h_change },
            { sym:'SOL',  p:data.solana?.usd,     c:data.solana?.usd_24h_change },
            { sym:'ADA',  p:data.cardano?.usd,    c:data.cardano?.usd_24h_change },
            { sym:'DOGE', p:data.dogecoin?.usd,   c:data.dogecoin?.usd_24h_change },
            { sym:'DOT',  p:data.polkadot?.usd,   c:data.polkadot?.usd_24h_change },
        ];
        var dbl   = coins.concat(coins);
        var track = document.getElementById('cryptoTrack');
        if (!track) return;
        track.innerHTML = '';
        dbl.forEach(function(coin) {
            var div = document.createElement('div'); div.className = 'ccoin';
            var sym = document.createElement('span'); sym.className = 'csym'; sym.textContent = coin.sym;
            var prc = document.createElement('span'); prc.className = 'cprc';
            prc.textContent = '$' + (coin.p ? coin.p.toLocaleString(undefined,{maximumFractionDigits:2}) : '—');
            var chg = document.createElement('span');
            var c   = coin.c || 0;
            chg.className   = 'cchg ' + (c >= 0 ? 'up' : 'dn');
            chg.textContent = (c >= 0 ? '▲' : '▼') + ' ' + Math.abs(c).toFixed(2) + '%';
            div.appendChild(sym); div.appendChild(prc); div.appendChild(chg);
            track.appendChild(div);
        });
    })
    .catch(function(e) { console.warn('Crypto fetch failed', e); });
}
fetchCrypto();
setInterval(fetchCrypto, 60000);

// PORTFOLIO FILTER 
var ftabs = document.querySelectorAll('.ftab');
var cards = document.querySelectorAll('.proj-card');

function applyFilter(filter) {
    var delayIdx = 0;
    
    cards.forEach(function(card) {
        var show = filter === 'all' || card.dataset.type === filter;
        
        if (!show) {
            card.style.display = 'none';
            card.classList.remove('showing');
        } else {
            card.style.display = 'block';
            
            card.classList.remove('showing');
            void card.offsetWidth; 
            card.classList.add('showing');
            
            card.style.animationDelay = (delayIdx * 120) + 'ms';
            delayIdx++;
        }
    });
}

ftabs.forEach(function(t) {
    t.addEventListener('click', function() {
        ftabs.forEach(function(x) { x.classList.remove('active'); });
        t.classList.add('active');
        applyFilter(t.dataset.filter);
        playClick();
    });
});

// REVEAL ON SCROLL 
var revealEls = document.querySelectorAll('.reveal');
var revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            var siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
            var idx = siblings.indexOf(entry.target);
            window.setTimeout(function() { entry.target.classList.add('visible'); }, idx * 60);
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '-40px 0px' });
revealEls.forEach(function(el) { revealObs.observe(el); });

// TOAST
var toastEl = document.getElementById('toast');
function showToast(msg, type) {
    toastEl.textContent = msg;
    toastEl.className   = 'toast ' + (type || '');
    window.setTimeout(function() { toastEl.classList.add('show'); }, 80);
    window.setTimeout(function() { toastEl.classList.remove('show'); }, 5000);
}

// CLICK SOUND 
function playClick() {
    try {
        var AC  = window.AudioContext || window.webkitAudioContext;
        var ac  = new AC();
        var osc = ac.createOscillator();
        var gn  = ac.createGain();
        osc.connect(gn); gn.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ac.currentTime + .07);
        gn.gain.setValueAtTime(0, ac.currentTime);
        gn.gain.linearRampToValueAtTime(.04, ac.currentTime + .02);
        gn.gain.linearRampToValueAtTime(0, ac.currentTime + .1);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + .12);
    } catch(e) {}
}

// COPYRIGHT YEAR
var yrEl = document.getElementById('yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();

updateScrollSpy();

//  CYBER TERMINAL & ARTISTIC BUST
document.addEventListener('DOMContentLoaded', function initTerminalArtBust() {
    const terminal = document.getElementById('terminalVisual');
    const container = document.getElementById('canvasContainer');
    const logsLeft = document.getElementById('logsLeft');
    const logsRight = document.getElementById('logsRight');
    
    if (!terminal || !container || !logsLeft || !logsRight || typeof THREE === 'undefined') {
        console.warn("Terminal visual or Three.js missing."); return;
    }

    // Coordinated Text Log Generator
    let logLine = 0;
    const securityMessages = [
        `[${new Date().toLocaleTimeString()}] **Initializing security audit...**`,
        `[SYS] Loading OWASP Top 10 vectors...`,
        `[SCN] *Nmap:* Scanning target subnet 192.168.1.0/24...`,
        `[AUD] Analysing *JWT* encoding implementation...`,`[ETH] Setting up honeypot Listener [Port 22, 80]...`,
        `[SYS] *Kernel security patches* check: em[OK]`,
        `[AUD] Found 2 potential em[CRLF] injection points.`,
        `[SCN] Port 80/tcp open (http). em[Version: Apache 2.4.41]`,
        `[ETH] Brute-force attempt detected from b[103.45.1.92]`,
        `[ETH] Blocked b[103.45.1.92] (IPtable updated)`,
        `[W3B] Analysing *Smart Contract* integrity...`,
        `[W3B] Solidity audit: 0 critical vulnerabilities. em[OK]`,
        `[SYS] Finalizing assessment report...`,
        `[${new Date().toLocaleTimeString()}] **Audit complete.**`,
        `--------------------------------`,
        `> usr@devrancis:~/ wait...`,
        `--------------------------------`,
    ];

    function generateLog() {
        const msg = securityMessages[logLine % securityMessages.length];
        const html = msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/b\[(.*?)\]/g, '<b>$1</b>');
        const newLine = document.createElement('div'); newLine.innerHTML = html;
        if (Math.random() > 0.5) {
            logsLeft.appendChild(newLine);
            if (logsLeft.scrollHeight > logsLeft.clientHeight) { logsLeft.scrollTop = logsLeft.scrollHeight; }
            if (logsLeft.children.length > 30) logsLeft.removeChild(logsLeft.firstChild);
        } else {
            logsRight.appendChild(newLine);
            if (logsRight.scrollHeight > logsRight.clientHeight) { logsRight.scrollTop = logsRight.scrollHeight; }
            if (logsRight.children.length > 30) logsRight.removeChild(logsRight.firstChild);
        }
        logLine++;
        setTimeout(generateLog, 600 + (Math.sin(logLine * 0.2) * 400));
    }
    setTimeout(generateLog, 1500); // Start text after delay


    // Three.js Artistic Logic 
    let scene, camera, renderer, skullGroup;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    function init3D() {
        scene = new THREE.Scene();

        const width = container.clientWidth;
        const height = container.clientHeight;
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.z = 3.2; // Pulled back slightly for the larger helmet

        // Setup Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        
        renderer.domElement.style.opacity = "0";
        renderer.domElement.style.transition = "opacity 0.8s ease-in-out";

        container.appendChild(renderer.domElement);

        skullGroup = new THREE.Group(); 
        
        //Dark Helmet Shell (Charcoal Metal)
        const shellMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111316,     
            roughness: 0.3,     
            metalness: 0.8,      
        });

        // The Faceplate (Muted Cyber-Gold/Bronze)
        const faceplateMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8a6d3b,      
            roughness: 0.25,     
            metalness: 0.9,      
        });

        // The Glowing Eyes (Neon Cyan)
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00d9ff 
        });

        // Main Helmet Dome
        const domeGeo = new THREE.SphereGeometry(1.05, 32, 32);
        const domeMesh = new THREE.Mesh(domeGeo, shellMaterial);
        skullGroup.add(domeMesh);

        // Lower Helmet 
        const jawGuardGeo = new THREE.BoxGeometry(1.4, 0.8, 1);
        const jawGuardMesh = new THREE.Mesh(jawGuardGeo, shellMaterial);
        jawGuardMesh.position.set(0, -0.6, 0.2);
        skullGroup.add(jawGuardMesh);

        // Ear Hinges 
        const hingeGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.15, 16);
        const hingeMesh = new THREE.Mesh(hingeGeo, shellMaterial);
        hingeMesh.rotation.z = Math.PI / 2; // Lay flat across X axis
        hingeMesh.position.set(0, -0.3, 0.2);
        skullGroup.add(hingeMesh);

        // The Gold Faceplate 
        const faceGeo = new THREE.CylinderGeometry(0.85, 0.35, 1.45, 6);
        const faceMesh = new THREE.Mesh(faceGeo, faceplateMaterial);
        faceMesh.scale.set(1, 1, 0.45); // Flatten it into a mask shape
        faceMesh.position.set(0, -0.3, 0.82); // Push it to the front
        faceMesh.rotation.y = Math.PI / 6; // Rotate so a flat edge faces perfectly forward
        skullGroup.add(faceMesh);

        // Forehead Cutout 
        const cutoutGeo = new THREE.BoxGeometry(0.75, 0.4, 0.6);
        const cutoutMesh = new THREE.Mesh(cutoutGeo, shellMaterial);
        cutoutMesh.position.set(0, 0.45, 0.95); // Overlaps the top of the gold faceplate
        skullGroup.add(cutoutMesh);

        // Glowing Eyes 
        const eyeGeo = new THREE.BoxGeometry(0.35, 0.08, 0.1);
        
        const eyeL = new THREE.Mesh(eyeGeo, eyeMaterial);
        eyeL.position.set(-0.32, 0.08, 1.05); // Placed on the faceplate
        eyeL.rotation.z = 0.15; // Slant down towards center
        eyeL.rotation.y = -0.1; // Follow curve of face
        skullGroup.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMaterial);
        eyeR.position.set(0.32, 0.08, 1.05);
        eyeR.rotation.z = -0.15; // Slant down towards center
        eyeR.rotation.y = 0.1; // Follow curve of face
        skullGroup.add(eyeR);

        scene.add(skullGroup);

        const ambientLight = new THREE.AmbientLight(0x111111);
        scene.add(ambientLight);

        const keyLight = new THREE.PointLight(0xffffff, 2.5, 10);
        keyLight.position.set(3, 2, 3);
        scene.add(keyLight);

        const fillLight = new THREE.PointLight(0x00ff64, 1.5, 8);
        fillLight.position.set(-3, -1, 2);
        scene.add(fillLight);

        const backLight = new THREE.PointLight(0x00d9ff, 4, 10);
        backLight.position.set(0, 3, -4);
        scene.add(backLight);

        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
    } 

    function onDocumentMouseMove(event) {
        if (window.innerWidth <= 1024) return; 

        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        mouseX = (event.clientX - windowHalfX) / windowHalfX;
        mouseY = (event.clientY - windowHalfY) / windowHalfY;
    }

    function onDeviceOrientation(event) {
        if (window.innerWidth > 1024) return; 

        if (event.gamma === null || event.beta === null) return;

        let gamma = event.gamma; 
        let beta = event.beta;   

        gamma = Math.max(-45, Math.min(45, gamma));
        beta = Math.max(20, Math.min(70, beta)); 

        mouseX = gamma / 45;
        mouseY = (beta - 45) / 25;
    }

    function onWindowResize() {
        if (!container || !renderer || !camera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (skullGroup) {
            if (window.innerWidth > 1024) {
                targetX = mouseX * 0.7; 
                targetY = mouseY * 0.4;
                skullGroup.rotation.y += (targetX - skullGroup.rotation.y) * 0.08; 
                skullGroup.rotation.x += (targetY - skullGroup.rotation.x) * 0.08; 
                
            } else {
                skullGroup.rotation.x += (0 - skullGroup.rotation.x) * 0.05; 
                
                skullGroup.rotation.y += 0.008; 
            }
        }

        renderer.render(scene, camera);
    
        if (renderer.domElement.style.opacity === "0") {
            setTimeout(() => {
                renderer.domElement.style.opacity = "1";
            }, 50);
        }
    }

    init3D();
    animate();
});


document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon'); 

    // Make sure all elements exist before running
    if (contactForm && submitBtn && btnText) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Stop standard redirect
            
            // Lock the button
            submitBtn.disabled = true;
            const originalText = btnText.innerHTML;

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            if (btnIcon) btnIcon.className = "fas fa-spinner fa-spin"; 

            btnText.innerHTML = "Encrypting payload...";
            await delay(800);
            
            btnText.innerHTML = "Establishing secure handshake...";
            await delay(900);
            
            btnText.innerHTML = "Bypassing proxies...";
            await delay(700);

            const formData = new FormData(contactForm);
            const resultBox = document.getElementById('resultBox'); 
            
            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                });
                
                if (response.ok) {
                    btnText.innerHTML = "Transmission secure.";
                    if (btnIcon) btnIcon.className = "fas fa-check-circle"; 
                    
                    submitBtn.style.color = "var(--bg)"; 
                    submitBtn.style.backgroundColor = "var(--acc)"; 
                    submitBtn.style.borderColor = "var(--acc)";
                    
                    if (resultBox) {
                        resultBox.className = "result-box result-success";
                        resultBox.innerHTML = "Message successfully encrypted and delivered to Francis.";
                        resultBox.style.display = "block";
                    }
                    
                    contactForm.reset();
                    
                    setTimeout(() => {
                        btnText.innerHTML = originalText;
                        if (btnIcon) btnIcon.className = "fas fa-paper-plane"; 
                        submitBtn.disabled = false;
                        submitBtn.style.color = "";
                        submitBtn.style.backgroundColor = "";
                        submitBtn.style.borderColor = "";
                        
                        if (resultBox) resultBox.style.display = "none";
                    }, 4000);
                } else {
                    throw new Error("API rejected");
                }
            } catch (error) {
                btnText.innerHTML = "Transmission intercepted (Error)";
                if (btnIcon) btnIcon.className = "fas fa-exclamation-triangle"; 
                
                submitBtn.style.color = "var(--bg)";
                submitBtn.style.backgroundColor = "var(--danger)"; 
                submitBtn.style.borderColor = "var(--danger)";

                if (resultBox) {
                    resultBox.className = "result-box result-error";
                    resultBox.innerHTML = "Warning: Transmission failed. Please try again or reach out directly.";
                    resultBox.style.display = "block";
                }
                
                setTimeout(() => {
                    btnText.innerHTML = originalText;
                    if (btnIcon) btnIcon.className = "fas fa-paper-plane";
                    submitBtn.disabled = false;
                    submitBtn.style.color = "";
                    submitBtn.style.backgroundColor = "";
                    submitBtn.style.borderColor = "";
                    
                    if (resultBox) resultBox.style.display = "none";
                }, 4000);
            }
        });
    }
});


window.addEventListener('beforeunload', () => {
    const container = document.getElementById('canvasContainer');
    if (container) {
        container.style.display = 'none'; 
        container.style.visibility = 'hidden';
    }
});