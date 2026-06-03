window.onload = function () {

    // =========================
    // ELEMENTS
    // =========================
    const items = document.querySelectorAll('.equipment-item');

    const img = document.getElementById('equipment-image');
    const title = document.getElementById('equipment-title');
    const desc = document.getElementById('equipment-desc');

    const video = document.getElementsByClassName("video-ref")[0];
    const canvasEl = document.getElementsByClassName("canvas")[0];

    const demoVideo = document.getElementById('demo-video');
    const playButton = document.querySelector('.play-button');

    if (!video || !canvasEl) {
        console.warn("Video or canvas not found — scrub disabled.");
    }

    const ctx = canvasEl ? canvasEl.getContext('2d') : null;

    // =========================
    // VIDEO SETUP
    // =========================
    if (video && canvasEl) {

        video.addEventListener('loadeddata', () => {
            canvasEl.width = video.videoWidth;
            canvasEl.height = video.videoHeight;
        }, { once: true });

        video.pause();
    }

    // =========================
    // EASING + SCRUB ENGINE
    // =========================

    function easeInOutQuad(t) {
        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    let lastUpdate = 0;

    function setTimeThrottled(video, targetTime) {
        const now = performance.now();

        if (now - lastUpdate > 40) {
            video.currentTime = targetTime;
            lastUpdate = now;
        }
    }

    let currentTarget = null;
    let animating = false;

    function smoothScrub(video, canvas, ctx, from, to) {
        currentTarget = to;

        if (animating) return;

        animating = true;

        const start = performance.now();
        const duration = 800;

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = easeInOutQuad(t);

            const targetTime = from + (currentTarget - from) * eased;

            setTimeThrottled(video, targetTime);

            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                animating = false;

                if (currentTarget !== to) {
                    smoothScrub(video, canvas, ctx, video.currentTime, currentTarget);
                }
            }
        }

        requestAnimationFrame(tick);
    }

    // expose globally for reuse (important for your setActive function)
    window.currentVideo = video;
    window.currentCanvas = canvasEl;
    window.currentCtx = ctx;

    // =========================
    // EQUIPMENT UI LOGIC
    // =========================

    function setActive(item) {

        const newTitle = item.dataset.title;
        const newImage = item.dataset.image;
        const newDesc = item.dataset.desc;
        const newFrame = item.dataset.frame;

        // IMAGE + TEXT
        if (newImage) img.src = newImage;
        if (newTitle) title.textContent = newTitle;
        if (newDesc) desc.textContent = newDesc;

        // ACTIVE STATE
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // VIDEO SCRUB (optional)
        if (newFrame && video) {

            const targetTime = parseFloat(newFrame);

            if (!isNaN(targetTime)) {
                smoothScrub(
                    video,
                    canvasEl,
                    ctx,
                    video.currentTime || 0,
                    targetTime
                );
            }
        }
    }

    // hover interaction
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            setActive(item);
        });
    });


    // WORKFLOW TABS
    const workflowTabs = document.querySelectorAll('.workflow-tab');
    const workflowPanels = document.querySelectorAll('.workflow-panel');

    workflowTabs.forEach(tab => {

        tab.addEventListener('click', () => {

            const target = tab.dataset.tab;

            // remove active states
            workflowTabs.forEach(t => t.classList.remove('active'));
            workflowPanels.forEach(panel => panel.classList.remove('active'));

            // activate current tab
            tab.classList.add('active');

            // activate matching panel
            document
                .querySelector(`.workflow-panel[data-panel="${target}"]`)
                .classList.add('active');
        });
    });

    //DEMO
    playButton.addEventListener('click', () => {
        demoVideo.play();
    });

    demoVideo.addEventListener('play', () => {
        playButton.style.opacity = '0';
        playButton.style.pointerEvents = 'none';
    });

    demoVideo.addEventListener('pause', () => {
        playButton.style.opacity = '1';
        playButton.style.pointerEvents = 'auto';
    });

    demoVideo.addEventListener('ended', () => {
        playButton.style.opacity = '1';
        playButton.style.pointerEvents = 'auto';
    });

    demoVideo.addEventListener('click', () => {

        if (demoVideo.paused) {
            demoVideo.play();
        } else {
            demoVideo.pause();
        }

    });
};