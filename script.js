/**
 * Semantic Austen - Main Script
 * Handles navigation, interactive viewers, and scroll behavior.
 */

document.addEventListener('DOMContentLoaded', () => {
    /* --- Sticky Header Logic --- */
    let lastScrollTop = 0;
    const nav = document.querySelector('nav');
    const scrollThreshold = window.innerHeight / 2;

    if (nav) {
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > scrollThreshold) {
                if (scrollTop > lastScrollTop) {
                    nav.classList.add('nav-hidden');
                } else {
                    nav.classList.remove('nav-hidden');
                }
            } else {
                nav.classList.remove('nav-hidden');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, false);
    }

    /* --- Mobile Menu Logic --- */
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    /* --- Media Carousel (Persuasion Page) --- */
    const carousel = document.getElementById('media-carousel');
    const prevArrow = document.getElementById('carousel-prev');
    const nextArrow = document.getElementById('carousel-next');

    if (carousel && prevArrow && nextArrow) {
        const scrollAmount = 330; // Card width + gap

        prevArrow.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextArrow.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        carousel.addEventListener('scroll', () => {
            prevArrow.style.opacity = carousel.scrollLeft <= 0 ? '0.3' : '1';
            prevArrow.style.pointerEvents = carousel.scrollLeft <= 0 ? 'none' : 'auto';

            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            nextArrow.style.opacity = carousel.scrollLeft >= maxScroll - 1 ? '0.3' : '1';
            nextArrow.style.pointerEvents = carousel.scrollLeft >= maxScroll - 1 ? 'none' : 'auto';
        });

        // Trigger initial state
        carousel.dispatchEvent(new Event('scroll'));
    }

    /* --- Custom Novel Page Functions (Manuscript Viewer - Persuasion Page) --- */
    const manuscriptImg = document.getElementById('manuscript-img');
    const transcriptionText = document.getElementById('transcription-text');
    const pageNumDisplay = document.getElementById('page-num');
    const manuscriptPrevBtn = document.getElementById('prev-btn');
    const manuscriptNextBtn = document.getElementById('next-btn');

    if (manuscriptImg && transcriptionText) {
        let persuasionXml = null;
        let persuasionXsl = null;

        const manuscriptPages = [
            {
                pageNum: 1,
                img: "img/persuasion/p.1.jpg",
                facs: "#facs_1"
            },
            {
                pageNum: 3,
                img: "img/persuasion/p.3.jpg",
                facs: "#facs_3"
            },
            {
                pageNum: 14,
                img: "img/persuasion/p.14.jpg",
                facs: "#facs_14"
            },
            {
                pageNum: 15,
                img: "img/persuasion/p.15.jpg",
                facs: "#facs_15"
            }
        ];

        let currentManuscriptPage = 0;
        let activeOverlay = null;

        async function initTranscription() {
            try {
                const [xmlResponse, xslResponse] = await Promise.all([
                    fetch('persuasion.xml'),
                    fetch('persuasion.xsl')
                ]);
                const xmlText = await xmlResponse.text();
                const xslText = await xslResponse.text();

                const parser = new DOMParser();
                persuasionXml = parser.parseFromString(xmlText, 'text/xml');
                persuasionXsl = parser.parseFromString(xslText, 'text/xml');

                updateManuscriptPage();

                // Add event listener for line clicks (using delegation)
                transcriptionText.addEventListener('click', (e) => {
                    const line = e.target.closest('.transcription-line, .transcription-p');
                    if (line && line.dataset.facs) {
                        highlightLine(line.dataset.facs, line);
                    }
                });
            } catch (error) {
                console.error('Error loading transcription files:', error);
                transcriptionText.innerHTML = '<p class="error-msg">Error loading digital transcription. Please ensure persuasion.xml and persuasion.xsl are available.</p>';
            }
        }

        function highlightLine(facsId, lineElement) {
            // Remove previous highlights
            document.querySelectorAll('.transcription-line.active').forEach(l => l.classList.remove('active'));
            if (activeOverlay) {
                activeOverlay.remove();
                activeOverlay = null;
            }

            // Add highlight to text
            lineElement.classList.add('active');

            // Find coordinates in XML
            const zoneId = facsId.replace('#', '');
            // More robust selector for xml:id
            const zone = persuasionXml.querySelector(`[*|id="${zoneId}"]`) ||
                persuasionXml.querySelector(`zone[xml\\:id="${zoneId}"]`) ||
                persuasionXml.getElementById(zoneId);

            if (zone && zone.getAttribute('points')) {
                const pointsStr = zone.getAttribute('points');
                drawHighlight(pointsStr);
            } else {
                console.warn(`No zone found for ${zoneId}`);
            }
        }

        function drawHighlight(pointsStr) {
            // Remove previous overlay if it exists
            if (activeOverlay) activeOverlay.remove();

            // Create SVG overlay
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "manuscript-overlay");

            // Position SVG exactly over the rendered image
            // We use offsetLeft/Top/Width/Height which represent the displayed dimensions
            svg.style.position = 'absolute';
            svg.style.left = `${manuscriptImg.offsetLeft}px`;
            svg.style.top = `${manuscriptImg.offsetTop}px`;
            svg.style.width = `${manuscriptImg.clientWidth}px`;
            svg.style.height = `${manuscriptImg.clientHeight}px`;

            // The viewBox should match the NATURAL dimensions of the original XML coordinates
            svg.setAttribute("viewBox", `0 0 ${manuscriptImg.naturalWidth} ${manuscriptImg.naturalHeight}`);

            const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.setAttribute("points", pointsStr.replace(/,/g, ' '));
            polygon.setAttribute("class", "highlight-zone");

            svg.appendChild(polygon);
            manuscriptImg.parentElement.appendChild(svg);
            activeOverlay = svg;
        }

        function renderTranscription(facsId) {
            if (!persuasionXml || !persuasionXsl) return '<p class="loading-msg">Loading digital transcription...</p>';

            try {
                const processor = new XSLTProcessor();
                processor.importStylesheet(persuasionXsl);
                processor.setParameter(null, 'pageFacs', facsId);

                const resultDoc = processor.transformToFragment(persuasionXml, document);
                if (!resultDoc) throw new Error("Transformation failed");

                const tempDiv = document.createElement('div');
                tempDiv.appendChild(resultDoc);
                return tempDiv.innerHTML;
            } catch (e) {
                console.error("XSLT Transformation Error:", e);
                return '<p class="error-msg">Transformation error. Check console for details.</p>';
            }
        }

        function updateManuscriptPage() {
            manuscriptImg.style.opacity = 0;
            transcriptionText.style.opacity = 0;

            // Clear previous highlight
            if (activeOverlay) {
                activeOverlay.remove();
                activeOverlay = null;
            }

            setTimeout(() => {
                const data = manuscriptPages[currentManuscriptPage];
                manuscriptImg.src = data.img;

                transcriptionText.innerHTML = renderTranscription(data.facs);
                transcriptionText.scrollTop = 0;

                if (pageNumDisplay) pageNumDisplay.innerText = data.pageNum;

                manuscriptImg.style.opacity = 1;
                transcriptionText.style.opacity = 1;

                if (manuscriptPrevBtn) manuscriptPrevBtn.disabled = currentManuscriptPage === 0;
                if (manuscriptNextBtn) manuscriptNextBtn.disabled = currentManuscriptPage === manuscriptPages.length - 1;

                // Match heights once image is loaded
                if (manuscriptImg.complete) {
                    adjustTranscriptionHeight();
                } else {
                    manuscriptImg.onload = adjustTranscriptionHeight;
                }
            }, 300);
        }

        function adjustTranscriptionHeight() {
            const box = document.querySelector('.transcription-box');
            // Match the height of the image as displayed on screen
            if (box && manuscriptImg.complete && manuscriptImg.clientHeight > 0) {
                const rect = manuscriptImg.getBoundingClientRect();
                box.style.height = `${rect.height}px`;
            } else if (box) {
                // Fallback if image not ready
                box.style.height = 'auto';
                box.style.maxHeight = '80vh';
            }
        }

        if (manuscriptPrevBtn) {
            manuscriptPrevBtn.addEventListener('click', () => {
                if (currentManuscriptPage > 0) {
                    currentManuscriptPage--;
                    updateManuscriptPage();
                }
            });
        }

        if (manuscriptNextBtn) {
            manuscriptNextBtn.addEventListener('click', () => {
                if (currentManuscriptPage < manuscriptPages.length - 1) {
                    currentManuscriptPage++;
                    updateManuscriptPage();
                }
            });
        }

        initTranscription();
        window.addEventListener('resize', adjustTranscriptionHeight);
    }

    /* --- Annotation Comparison Viewer (Annotation Page) --- */
    const evalImg = document.getElementById('eval-img');
    const ai1Text = document.getElementById('ai-1-text');
    const ai2Text = document.getElementById('ai-2-text');
    const evalPageNum = document.getElementById('eval-page-num');
    const evalPrevBtn = document.getElementById('eval-prev');
    const evalNextBtn = document.getElementById('eval-next');

    if (evalImg && ai1Text && ai2Text) {
        const evalPages = [
            {
                img: "img/eval/p.1.jpg",
                ai1: `<p>all the changes of each at the<br>
encert, to be miserable by this<br>
morning's circumstantial report, to<br>
be non, morr happy than Languy<br>
could expreſs, or any heart but his<br>
There was timed<br>
own be capable<br>
f<br>
was all this to be said — & with<br>
as en<br>
such Interrurptions only<br>
commenelatinn<br>
hanced the chaim of comvariate<br>
:and Bath id. scarcely contain on<br>
at once &<br>
ep<br>
other<br>
apeings mon rationally & so<br>
raptusovely happy as duving that<br>
event occupied the Sopha of of<br>
Mrs . Crofts Drawing room in GaySt<br>
Capt.W. — had taken care t o<br>
meet the Adml. — as he returned info<br>
the house, to satisfy, &<br>
:dearner to sclence him on the<br>
subject of his enquin Mr . E.–<br>
"Kallyuch; — and the minate delicay<br>
nature<br>
of the Admirals goodhun<br>
kept him from saying another<br>
and on the subject to Anne —<br>
He was quite uncerned lest he<br>
might have been giving her<br>
prain by touching a tender part<br>
who could say — — She might be<br>
liking her Cousin, better than<br>
he liked her." — And indeed</p>`,
                ai2: `<p>all the changes of each at the<br>
concert, to be miserable by this<br>
morning’s circumstantial report, to<br>
be now, more happy than language<br>
could express, or any heart but hers<br>
may be capable of. ^x^ Then was time<br>
^for^ all this to be [del: said] — With<br>
such interruptions only as en-<br>
hanced the charm of ^the communication^<br>
[del: — and Bath c<sup>d</sup>. scarcely contain any]<br>
[del: other two] beings ^at once^ so rationally & so<br>
rapturously happy as during that<br>
event. occupied the Sopha. of the<br>
Adml. Croft’s Drawing room in Gay St.<br>
Capt. W. — had taken care to<br>
meet the Adml. as he returned into<br>
the house, to satisfy [del: himself] ^him^ [del: as to:]<br>
[del: them — to silence them on the] ^as to the^<br>
subject of his enquiring [del: Mr. E —] ^at^<br>
Kellynch; — and the [del: private] ^natural^ delicacy<br>
of the Admiral’s good-[ins: natured]-humour<br>
kept him from saying another<br>
word on the subject to Anne. —<br>
He was quite concerned lest he<br>
might have been giving her<br>
pain by touching a tender part.<br>
Who could say? — She might be<br>
liking her Cousin, better than<br>
he liked her.</p>
<div class="transcription-key">
<strong>Transcription Key:</strong><br>
[del: word] : Text crossed out in the original.<br>
^word^ / [ins: word] : Text inserted above the line or in the margin.<br>
x : Represents a cross-reference mark or insertion indicator used by the author.<br>
c<sup>d</sup> : Preservation of the author's superscript abbreviation for "could".<br>
& : Preservation of the ampersand as written.<br>
— : Preservation of the author's characteristic long dashes.
</div>`
            },
            {
                img: "img/eval/p.2.jpg",
                ai1: "<p>The arrival of Captain Wentworth has thrown the neighborhood into a state of considerable excitement. It is strange to see him again after so long...</p>",
                ai2: "<p>The arrival of Captrin Wentwrth has thrown the neighborhood into a state of considerble excitement. It is strange to se him again after so long...</p>"
            },
            {
                img: "img/eval/p.3.png",
                ai1: "<p>Lyme Regis provided a much-needed change of scene. The sea air is bracing, and the company of the Harvilles is a true relief...</p>",
                ai2: "<p>Lyme Regis provided a much-neded change of sene. The sea air is bracing, and the company of the Harvilles is a true relief...</p>"
            },
            {
                img: "img/eval/p.4.jpg",
                ai1: "<p>Bath is as crowded and superficial as ever. I find myself longing for the simple pleasures of Uppercross, despite the frequent complaints...</p>",
                ai2: "<p>Bath is as crowded and superficial as ever. I find myself longing for the simple pleasures of Uppercros, despite the frequent complaints...</p>"
            },
            {
                img: "img/eval/p.5.png",
                ai1: "<p>I saw Mr. Elliot in the Pump Room today. He is a man of undeniable charm and elegance, yet there is something about his character...</p>",
                ai2: "<p>I saw Mr. Elliot in the Pump Room today. He is a man of undeniable charm and elegance, yet there is something about his charcter...</p>"
            },
            {
                img: "img/eval/p.6.png",
                ai1: "<p>I can no longer listen in silence. I must speak to you by such means as are within my reach. You pierce my soul. I am half agony, half hope...</p>",
                ai2: "<p>I cen no longer listen in silence. I must speak to you by such mens as are within my reach. You pierce my soul. I am half agony, half hop...</p>"
            }
        ];

        let currentEvalPage = 0;

        function updateEvalPage() {
            const data = evalPages[currentEvalPage];

            [evalImg, ai1Text, ai2Text].forEach(el => el.style.opacity = 0);

            setTimeout(() => {
                evalImg.src = data.img;
                ai1Text.innerHTML = data.ai1;
                ai2Text.innerHTML = data.ai2;
                if (evalPageNum) evalPageNum.innerText = currentEvalPage + 1;

                [evalImg, ai1Text, ai2Text].forEach(el => el.style.opacity = 1);

                if (evalPrevBtn) evalPrevBtn.disabled = currentEvalPage === 0;
                if (evalNextBtn) evalNextBtn.disabled = currentEvalPage === evalPages.length - 1;
            }, 300);
        }

        if (evalPrevBtn) {
            evalPrevBtn.addEventListener('click', () => {
                if (currentEvalPage > 0) {
                    currentEvalPage--;
                    updateEvalPage();
                }
            });
        }

        if (evalNextBtn) {
            evalNextBtn.addEventListener('click', () => {
                if (currentEvalPage < evalPages.length - 1) {
                    currentEvalPage++;
                    updateEvalPage();
                }
            });
        }

        updateEvalPage();
    }
});
