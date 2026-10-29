const avatar = document.getElementById("avatar");

if (avatar) {
    const openEyes = avatar.dataset.open;
    const closedEyes = avatar.dataset.closed;

    const closedImage = new Image();
    closedImage.src = closedEyes;

    function blink() {
        // Zatvaranje očiju
        avatar.src = closedEyes;

        // Sporije otvaranje očiju
        setTimeout(() => {
            avatar.src = openEyes;
        }, 350);

        // Češće treptanje: svakih 1.5 do 3 sekunde
        const nextBlink = 1500 + Math.random() * 1500;
        setTimeout(blink, nextBlink);
    }

    setTimeout(blink, 1500);
}



/* ===== SOFT-BODY INTERACTIVE WAVES ===== */

const waveGroup = document.getElementById("wave-lines");

if (waveGroup) {
    const svg = waveGroup.ownerSVGElement;
    const svgNS = "http://www.w3.org/2000/svg";

    const WIDTH = 1440;
    const HEIGHT = 900;
    const LINE_COUNT = 85;
    const STEP = 24;

    const lines = [];
    const mouse = {
        x: -1000,
        y: -1000,
        active: false
    };

    // Pratimo poziciju miša.
    window.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;

        const matrix = svg.getScreenCTM();
        if (!matrix) return;

        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;

        const local = point.matrixTransform(matrix.inverse());

        mouse.x = local.x;
        mouse.y = local.y;
        mouse.active = true;
    });

    document.addEventListener("pointerout", (event) => {
        if (!event.relatedTarget) {
            mouse.active = false;
        }
    });

    window.addEventListener("blur", () => {
        mouse.active = false;
    });

    // Svaka linija ima tačke koje se ponašaju kao opruge.
    for (let i = 0; i < LINE_COUNT; i++) {
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("class", "wave-line");
        waveGroup.appendChild(path);

        const points = [];

        for (let y = -120; y <= HEIGHT + 120; y += STEP) {
            points.push({
                y: y,
                offset: 0,
                velocity: 0
            });
        }

        lines.push({ path, points, index: i });
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let lastTime = 0;

    function animateWaves(timestamp) {
        const dt = lastTime
            ? Math.min((timestamp - lastTime) / 16.67, 2)
            : 1;

        lastTime = timestamp;

        const t = timestamp * 0.00018;

        lines.forEach((line) => {
            const i = line.index;

            const baseX =
                (i / (LINE_COUNT - 1)) * (WIDTH + 240) - 120;

            const coords = [];

            line.points.forEach((point) => {
                const y = point.y;

                // Veliki, spori valovi.
                const wave1 =
                    105 * Math.sin(y * 0.0045 + t + i * 0.028);

                const wave2 =
                    55 * Math.sin(y * 0.009 - t * 0.65 + i * 0.04);

                // Mjesta gdje se linije skupljaju i šire.
                const pinch =
                    80 *
                    Math.sin(y * 0.0035 - t * 0.45) *
                    Math.sin(i * 0.07);

                const naturalX = baseX + wave1 + wave2 + pinch;

                // Miš odbija linije u svojoj blizini.
                let force = 0;

                if (mouse.active && !reducedMotion) {
                    const dx = naturalX + point.offset - mouse.x;
                    const dy = y - mouse.y;

                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const radius = 175;

                    if (distance < radius) {
                        const influence = 1 - distance / radius;

                        // Elastično guranje lijevo ili desno.
                        const direction = dx >= 0 ? 1 : -1;

                        force = direction * influence * influence * 3.5;
                    }
                }

                // Fizika opruge: sila, povratak i trenje.
                const spring = -point.offset * 0.025;
                const damping = -point.velocity * 0.10;

                point.velocity += (force + spring + damping) * dt;
                point.offset += point.velocity * dt;

                // Ograničavamo pomjeranje da ostane elegantno.
                point.offset = Math.max(
                    -90,
                    Math.min(90, point.offset)
                );

                const x = naturalX + point.offset;

                coords.push(`${x.toFixed(1)},${y}`);
            });

            line.path.setAttribute(
                "d",
                "M " + coords.join(" L ")
            );
        });

        if (!reducedMotion) {
            requestAnimationFrame(animateWaves);
        }
    }

    if (reducedMotion) {
        animateWaves(0);
    } else {
        requestAnimationFrame(animateWaves);
    }
}




/* ===== TYPING ANIMATION ===== */

const typingElement = document.getElementById("typing-text");

if (typingElement) {
    const messages = [
        "Running on coffee, code, and curiosity.",
        'git commit -m "it works, don\'t touch it"',
        "MSc student turning ideas into code."
    ];

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeMessage() {
        const currentMessage = messages[messageIndex];

        if (!isDeleting) {
            charIndex++;
            typingElement.textContent =
                currentMessage.substring(0, charIndex);

            if (charIndex === currentMessage.length) {
                isDeleting = true;
                setTimeout(typeMessage, 2200);
                return;
            }
        } else {
            charIndex--;
            typingElement.textContent =
                currentMessage.substring(0, charIndex);

            if (charIndex === 0) {
                isDeleting = false;
                messageIndex = (messageIndex + 1) % messages.length;
                setTimeout(typeMessage, 450);
                return;
            }
        }

        const speed = isDeleting ? 35 : 75;
        setTimeout(typeMessage, speed);
    }

    setTimeout(typeMessage, 800);
}


/* ===== INTERACTIVE PORTFOLIO TERMINAL ===== */

const terminalOverlay = document.getElementById("terminal-overlay");
const openTerminal = document.getElementById("open-terminal");
const closeTerminal = document.getElementById("close-terminal");
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");

if (terminalOverlay && openTerminal && terminalInput) {

    function showTerminal() {
        terminalOverlay.classList.add("open");
        terminalInput.focus();
    }

    function hideTerminal() {
        terminalOverlay.classList.remove("open");
        openTerminal.focus();
    }

    openTerminal.addEventListener("click", showTerminal);
    closeTerminal.addEventListener("click", hideTerminal);

    terminalOverlay.addEventListener("click", (event) => {
        if (event.target === terminalOverlay) {
            hideTerminal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" &&
            terminalOverlay.classList.contains("open")) {
            hideTerminal();
        }
    });

    const commands = {
        help:
            "Available commands:\n" +
            "help      - Show available commands\n" +
            "about     - About me\n" +
            "skills    - My technical skills\n" +
            "projects  - My GitHub projects\n" +
            "contact   - Contact information\n" +
            "clear     - Clear terminal\n" +
            "exit      - Close terminal",

        about:
            "Hi! I'm Irma Lemeš, an MSc student in " +
            "Computer Science & Informatics and a software developer.",

        skills:
            "C++, C#, Java, Kotlin, Python, JavaScript\n" +
            ".NET, Qt, Node.js, Docker, MySQL, SQLite, Supabase",

        projects:
            "ERC ZIPO Report Inventory System\n" +
            "ScenarijPro\n" +
            "FilmMate\n" +
            "NewsFeedApp\n" +
            "YourRide\n" +
            "Explore: https://github.com/irmalemes",

        contact:
            "Email: irmalemes09@gmail.com\n" +
            "GitHub: github.com/irmalemes"
    };

    function addOutput(text, className) {
        const line = document.createElement("div");
        line.className = className;
        line.textContent = text;

        terminalOutput.appendChild(line);

        document.getElementById("terminal-body")
            .scrollTop =
            document.getElementById("terminal-body").scrollHeight;
    }

    terminalInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        const command = terminalInput.value.trim().toLowerCase();

        if (!command) return;

        addOutput("> " + command, "terminal-command");
        terminalInput.value = "";

        if (command === "clear") {
            terminalOutput.innerHTML = "";
            return;
        }

        if (command === "exit") {
            hideTerminal();
            return;
        }

        const response = commands[command] ||
            `Command not found: ${command}. Type 'help'.`;

        addOutput(response, "terminal-response");
    });
}


/* ===== CONTACT FORM ===== */

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);

        const name = String(formData.get("name")).trim();
        const email = String(formData.get("email")).trim();
        const message = String(formData.get("message")).trim();

        const subject = encodeURIComponent(
            "Portfolio message from " + name
        );

        const body = encodeURIComponent(
            "Name: " + name + "\n" +
            "Email: " + email + "\n\n" +
            message
        );

        window.location.href =
            "mailto:irmalemes09@gmail.com" +
            "?subject=" + subject +
            "&body=" + body;
    });
}

