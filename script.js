
// ======================================
// TG CROOS PARTICLE TRANSFORMATION
// iPhone & Mobile Optimized
// ======================================

const canvas = document.getElementById("croosCanvas");

if (canvas) {
    const ctx = canvas.getContext("2d");

    let width, height;
    let particles = [];

    const particleCount = 1200;

    let phase = "formation";
    let phaseStart = performance.now();

    const durations = {
        formation: 2500,
        rotation: 3000,
        text: 4000,
        explosion: 2200
    };

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();

        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createParticles();
    }

    function randomSpherePoint() {
        const u = Math.random() * 2 - 1;
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(1 - u * u);

        return {
            x: radius * Math.cos(theta),
            y: u,
            z: radius * Math.sin(theta)
        };
    }

    function createParticles() {
        particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                sphere: randomSpherePoint(),
                text: { x: 0, y: 0 },
                blastX: 0,
                blastY: 0,
                size: Math.random() * 1.5 + 1,
                speed: Math.random() * 2 + 1
            });
        }

        createTextTargets();
    }

    // CLEAR AND LARGE TG CROOS TEXT
    function createTextTargets() {
        const offCanvas = document.createElement("canvas");
        const offCtx = offCanvas.getContext("2d");

        offCanvas.width = Math.ceil(width);
        offCanvas.height = Math.ceil(height);

        let fontSize = Math.min(width * 0.19, height * 0.38, 100);

        fontSize = Math.max(fontSize, 20);

        offCtx.font = `900 ${fontSize}px Arial, sans-serif`;
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.fillStyle = "#ffffff";

        offCtx.fillText("TG CROOS", width / 2, height / 2);

        const imageData = offCtx.getImageData(
            0, 0, offCanvas.width, offCanvas.height
        );

        const points = [];

        for (let y = 0; y < offCanvas.height; y += 2) {
            for (let x = 0; x < offCanvas.width; x += 2) {
                const index = (y * offCanvas.width + x) * 4;

                if (imageData.data[index + 3] > 100) {
                    points.push({ x, y });
                }
            }
        }

        // Shuffle target positions
        for (let i = points.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [points[i], points[j]] = [points[j], points[i]];
        }

        particles.forEach((particle, i) => {
            if (points.length > 0) {
                particle.text = points[i % points.length];
            }
        });
    }

    function ease(t) {
        return t * t * (3 - 2 * t);
    }

    function drawSphere(particle, time) {
        const rotation = time * 0.001;

        const x =
            particle.sphere.x * Math.cos(rotation) -
            particle.sphere.z * Math.sin(rotation);

        const z =
            particle.sphere.x * Math.sin(rotation) +
            particle.sphere.z * Math.cos(rotation);

        const scale = Math.min(width, height) * 0.30;
        const perspective = 1 / (2 - z * 0.5);

        return {
            x: width / 2 + x * scale * perspective,
            y: height / 2 + particle.sphere.y * scale * perspective,
            alpha: (z + 1.5) / 2.5
        };
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        let elapsed = time - phaseStart;
        let progress = Math.min(elapsed / durations[phase], 1);

        if (progress >= 1) {
            if (phase === "formation") {
                phase = "rotation";
            } else if (phase === "rotation") {
                phase = "text";
            } else if (phase === "text") {
                phase = "explosion";

                particles.forEach(p => {
                    const angle = Math.atan2(
                        p.y - height / 2,
                        p.x - width / 2
                    );

                    const speed = Math.random() * 9 + 4;

                    p.blastX = Math.cos(angle) * speed;
                    p.blastY = Math.sin(angle) * speed;
                });

            } else {
                phase = "formation";

                particles.forEach(p => {
                    p.x = Math.random() * width;
                    p.y = Math.random() * height;
                });
            }

            phaseStart = time;
            progress = 0;
        }

        particles.forEach(p => {
            let alpha = 1;

            if (phase === "formation") {
                const target = drawSphere(p, time);

                p.x += (target.x - p.x) * 0.035;
                p.y += (target.y - p.y) * 0.035;

                alpha = target.alpha;

            } else if (phase === "rotation") {
                const target = drawSphere(p, time);

                p.x = target.x;
                p.y = target.y;

                alpha = target.alpha;

            } else if (phase === "text") {
                p.x += (p.text.x - p.x) * 0.065;
                p.y += (p.text.y - p.y) * 0.065;

                alpha = 1;

            } else if (phase === "explosion") {
                p.x += p.blastX;
                p.y += p.blastY;

                p.blastX *= 0.985;
                p.blastY *= 0.985;

                alpha = Math.max(0, 1 - progress);
            }

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = `rgba(210, 160, 255, ${alpha})`;

            ctx.shadowBlur = 10;
            ctx.shadowColor = "#b45cff";

            ctx.fill();

            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();

    requestAnimationFrame(animate);
}
// Initialize EmailJS safely
if (typeof emailjs !== "undefined") {
    emailjs.init({
        publicKey: "eoHln2FDngGvtBJnq",
    });
}

const contactForm = document.querySelector(".contact-form form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const submitButton = contactForm.querySelector("button[type='submit']");

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        emailjs.sendForm(
            "service_0db2zfr",
            "template_ab9ecas",
            contactForm
        ).then(function () {
            document.getElementById("successPopup").classList.add("active");
            contactForm.reset();
        }).catch(function (error) {
            console.error("EmailJS Error:", error);
            alert("Message could not be sent. Please try again.");
        }).finally(function () {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
        });
    });
}
function closeSuccessPopup() {
    document.getElementById("successPopup").classList.remove("active");
}

// medITrail Popup Functions

function showMedITrailDetails() {
    document.getElementById("medITrailPopup").classList.add("active");
}

function closeMedITrailDetails() {
    document.getElementById("medITrailPopup").classList.remove("active");
}

// Close popup when clicking outside
document.getElementById("medITrailPopup")?.addEventListener("click", function(event) {
    if (event.target === this) {
        closeMedITrailDetails();
    }
});
// Rithu Milk Products Popup Functions

function showRithuDetails() {
    document.getElementById("rithuPopup").classList.add("active");
}

function closeRithuDetails() {
    document.getElementById("rithuPopup").classList.remove("active");
}

// Close popup when clicking outside
document.getElementById("rithuPopup")?.addEventListener("click", function(event) {
    if (event.target === this) {
        closeRithuDetails();
    }
});
// ===== SERVICE CARD FLIP - IPHONE & MOBILE FIX =====

document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(".service-card");

    cards.forEach(function (card) {

        card.addEventListener("click", function (event) {

            event.preventDefault();

            card.classList.toggle("flipped");

        });

    });

});