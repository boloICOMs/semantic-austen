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
he liked her. And indeed,</p>`
            },
            {
                img: "img/eval/p.2.jpg",
                ai1: `<p>upon recollection, it they have<br>
many at all it was<br>
ave<br>
been<br>
tha<br>
beef t<br>
I should thei<br>
sclosed<br>
ao<br>
whe t<br>
of oner<br>
on<br>
When the Evenf. was<br>
it is probable that the Adml.<br>
received somy new Ideas from his<br>
whose<br>
asterularly frind<br>
wife; – the<br>
barl<br>
silfh<br>
manner in whas<br>
with her, made Anne beleive<br>
— the gratifyeng Be:<br>
pleast thate see<br>
perscousion<br>
:lir of her sheavly approving.<br>
what she saw a conpectured.<br>
It had ben such a day to<br>
Anne! — the houses which had<br>
paſsed since her leaving Camding<br>
Place, had done so much.<br>
She was almost beweldered, al<br>
:most too happy in refliating<br>
bat<br>
It was neceſsary to set us<br>
looking<br>
:night & lie awake the<br>
half the<br>
renguibe<br>
relt to comprehend with compo:<br>
:sure her present state, & pay<br>
for the overplies of Bliſs, by<br>
Madake & Tatigue.</p>`,
                ai2: `<p>upon recollection, if they had<br>
[del: been to many at all, it was]<br>
[del: why should they have been — [del: to be read.]]<br>
When the door [del: was] closed [del: upon]<br>
it is probable that the Adml<br>
received some new Ideas from his<br>
wife; — [del: that] ^the^ ^whole^ [del: particularly kind]<br>
manner in [del: which she] ^she^ ^had^ ^parted^ [del: treated]<br>
with her, [del: gave] made Anne [del: feel]<br>
at least [del: that] the gratifying [del: be-]<br>
[del: lief, of her being] approving.<br>
[del: what she saw & conjectured].<br>
It had been such a day to<br>
Anne! the hours which had<br>
passed since her leaving Camden<br>
Place, had done so much! —<br>
She was almost bewildered, al-<br>
most too happy in [del: reflecting]<br>
^looking back^. It was necessary to sit up<br>
half the night & lie awake the<br>
[del: rest to] ^remainder^ ^to^ comprehend with compo-<br>
sure her present state, & pay<br>
for the surplus of Bliss, by<br>
Headake & Fatigue. —</p>`
            },
            {
                img: "img/eval/p.3.png",
                ai1: `<p>I am not going to dance with Master Blape Tin<br>
a little<br>
The Gentleman guite disconcerted, could only<br>
hope he might be more fortunate another<br>
time — & seeming unwilling to leave her, tho<br>
his freind Ld . Osborne was waiting in the Door —<br>
way for the result, as Emma sa with some<br>
makelivily<br>
perclived<br>
amusement — he soon soin began to exquisies<br>
after her family. —"How comes it, that we have<br>
not the pleasure of seeing your Sisters here thes<br>
evening. — Our Aſsemblies have been used to be<br>
so will treated by them, that we do not know<br>
this neglect.<br>
how to take ther abence. — "My eldest Sister<br>
is the only one at home — & she could not leave<br>
"Miſs Watson the only<br>
my Father — said Emma with noil one at<br>
home. – You astonish me. — It seems but<br>
the day before yesterday that I saw them<br>
all three in this Town. But I am afraid I<br>
have been a very sad neighbour of late. I<br>
hear dreadful complaints of my negligence.<br>
& I confeſsi<br>
whenever I go. — It is a shameful length.<br>
of time since I was at stanton. — But<br>
now indeavour to<br>
I feel that I shall soome make myself<br>
amings for the past. – Emma's calm cust:<br>
les ase<br>
follantoy must hade<br>
ie o tel to tatan tee mus</p>`,
                ai2: `<p>“I am not going to dance with Master Blake Sir.”<br>
The Gentleman [del: quite] ^a little^ disconcerted, could only<br>
hope he might be more fortunate another<br>
time. — Seeming unwilling to leave her, tho’<br>
his friend Ld. Osborne was waiting in the Door-<br>
=way for the result as Emma [del: saw] ^perceived^ with some<br>
amusement — he [del: however] ^makeshift^ began to enquire<br>
after her family. — “How comes it, that we have<br>
not the pleasure of seeing your Sisters here this<br>
evening? — Our Assemblies have been used to be<br>
so well treated by them, that we do not know<br>
how to take [del: their absence] ^this neglect^.” — “My eldest Sister<br>
is the only one at home — & she could not leave<br>
my Father. — said [del: Emma with a smile] ^“Miss Watson the only one at^<br>
home.” — “You astonish me!” — It seems but<br>
the day before yesterday that I saw them<br>
all three in this Town. But I am afraid I<br>
have been a very bad neighbour of late. I<br>
hear dreadful complaints of my negligence<br>
wherever I go.” — “^& I confess^ It is a shameful length<br>
of time since I was at Stanton. — But<br>
[del: I feel that] ^now endeavour to^ I shall [del: soon] make myself<br>
amends for the past.” — “Emma’s calm Curt-<br>
sy in reply to [del: all this gallantry] must have</p>`
            },
            {
                img: "img/eval/p.4.jpg",
                ai1: `<p>stuck him as very unlike the gratituleng here<br>
Sisters encouraging warmth he had beed tired to<br>
receive from her Sisters, & gave him probably the<br>
novel semration of doubting his own influence, &<br>
beslowed.<br>
wishing for more attention than she god<br>
&ben<br>
The dancing now recommenced; Miſs Carr was<br>
impatient to Call, every bady was required to<br>
stand up — & Tom Musgrave’s curiosity was ap:<br>
ne forwald & elair<br>
ahed<br>
on seeing in<br>
:peases, be seeng Howard came to elo<br>
Emma’'s han<br>
prartner. — "That will do as well for me — was<br>
when his friend carried<br>
heaving her ſing<br>
Ld . Osbornes remark, when<br>
him the ews —–<br>
– — & he was continually at tho<br>
two<br>
:wards Elbow dusing the dances. —The frequint<br>
of his apparance there, was the only unpleasont<br>
part of her engagement, to dmay the only ob:<br>
:fection she could make to Mr . Howard. — Ior<br>
himself she thought him as agreable as he<br>
topies<br>
looked; tho chatting on the commonest mall<br>
sensible<br>
he had an easy, unaffected, Hurnpretending man:<br>
:nere which of expreſsing himself, which made<br>
them all worth hearing, & she only reqritted<br>
that he had not been able to make his<br>
hupils Manners as unexceptionable as his<br>
own. — "he two dances seemed very short,<br>
& she had her pastnes’s authority for emordired</p>`,
                ai2: `<p>struck him as very unlike the [del: gratitude of her]<br>
[del: Sisters] encouraging warmth he had been used to<br>
receive from her sisters, & gave him probably the<br>
novel sensation of doubting his own influence, &<br>
wishing for more attention than she [del: gave] ^bestowed^.<br>
The dancing now recommenced; Miss Carr [del: was] ^being^<br>
impatient to call, everybody was required to<br>
stand up. — & Tom Musgrave’s curiosity was ap:<br>
:peased [del: on seeing Mr] ^on seeing Mr^ Howard [del: come to claim] ^come forward & claim^<br>
[del: Emma’s] hand; “That will do as well for me” — was<br>
Ld Osborne’s remark, [del: when his friend carried] ^when his friend carried^<br>
[del: him the news —] & he was continually at Ho:<br>
:ward’s elbow during the [del: two] ^two^ dances. — The frequency<br>
of his appearance there, was the only unpleasant<br>
part of her engagement [del: to Emma], the only ob:<br>
:jection she could make to Mr Howard. — In<br>
himself, she thought him as agreeable as he<br>
looked; tho’ chatting on the commonest ^topics^<br>
he had a [del: way] ^sensible^, unaffected, ^way^<br>
[del: of expressing himself] of expressing himself, which made<br>
them all worth hearing; & she only regretted<br>
that he had not been able to make his<br>
pupils’ manners as unexceptionable as his<br>
own. —— The two dances seemed very short<br>
& she had her partner’s authority for considering</p>`
            },
            {
                img: "img/eval/p.5.png",
                ai1: `<p>P 29 <br>
<br>
20<br>
Chapter the second<br>
For thre months did the Masgues<br>
:rade afford ample subject for conversation<br>
to their inhabitants of Pammydiddle; but not<br>
character at it was so fully expatialed<br>
on as Charles Adams. The singularity of her<br>
appearance, the beams which darled from<br>
his eyes, the brightneſs of his Wit, & the<br>
whole bout ensemble of his person had sub:<br>
:dued the hearts of so many of the young<br>
Ladies, that of the six present at the<br>
Masquerade but five had returned uncap:<br>
tivated. Alice Johnson was the unhappy<br>
sixth whose heart had aot been able to<br>
withstand the power of his Charms. But as<br>
may<br>
appear strange to my Reades,</p>`,
                ai2: `<p>( 29<br>
<br>
              Chapter the Second<br>
<br>
            For three months did the Masque:<br>
-rade afford ample subject for conversation<br>
to the inhabitants of Pammydiddle; but no<br>
character at it was so fully expatiated<br>
on as Charles Adams. The singularity of his<br>
appearance, the beams which darted from<br>
his eyes, the brightness of his Wit, & the<br>
whole tout ensemble of his person had sub:<br>
:dued the hearts of so many of the young<br>
Ladies, that of the six present at the<br>
Masquerade but five had returned uncap:<br>
:tivated. Alice Johnson was the unhappy<br>
sixth whose heart had not been able to<br>
withstand the power of his Charms. But as<br>
it may appear strange to my Readers,</p>`
            },
            {
                img: "img/eval/p.6.png",
                ai1: `<p>so much worth and Excellence as he<br>
ed should have conquired only Lers<br>
& be neceſsary to inform thim that<br>
f Limpsons were defended foom his<br>
by Ambition, Envy, & Selfadmiratinn<br>
iry wish of Caroline was undered<br>
Hled Shsband, whilst in Sukey such<br>
& excellence whld only raise he<br>
&Enoy<br>
Sove, & Cevilia was too tenderly it.<br>
to herself to be pleased with any<br>
hs<br>
rides. As for Lady Willia<br>
es of the<br>
m was too<br>
s the form<br>
"A, to fall. in love with one so<br>
Iunior<br>
her enprise & the latter, tho very<br>
& very paſsionate was too fond of<br>
Susband to think of such a thing</p>`,
                ai2: `<p>30 /<br>
<br>
that so much worth and Excellence as he<br>
possessed should have conquered only hers,<br>
it will be necessary to inform them that<br>
the Miss Simpsons were defended from his<br>
Power by Ambition, Envy, & Selfadmiration.<br>
<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Every wish of Caroline was centered<br>
in a titled Husband; whilst in Sukey such<br>
superior excellence could only raise her Envy,<br>
not her Love, & Cecilia was too tenderly at:<br>
:tached to herself to be pleased with any<br>
one besides. As for Lady Williams and<br>
Mrs Jones, the former of them was too<br>
sensible, to fall in love with one so<br>
^Junior^<br>
much her [del: inferior] & the latter; tho' very<br>
tall & very passionate was too fond of<br>
her Husband to think of such a thing.</p>`
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
