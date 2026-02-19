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
        const manuscriptPages = [
            {
                pageNum: 1,
                img: "img/persuasion/p.1.jpg",
                transcription: `
                    <p>My dear Cassandra,</p>
                    <p>You will be surprised to hear that I am once again at my desk. The weather has been most unpropitious for walking, and I find myself drawn back to the quiet of my studies. Persuasion is a curious thing, is it not? How the heart maintains its course despite the passing years...</p>
                    <p>Yesterday, we received word from the Musgroves. They are all well, though Mary continues to complain of her delicate health. Anne seems the only one with any true sense in that household.</p>
                `
            },
            {
                pageNum: 3,
                img: "img/persuasion/p.3.jpg",
                transcription: `
                    <p>Lyme Regis provided a much-needed change of scene. The sea air is bracing, and the company of the Harvilles is a true relief from the endless social posturing of Bath. Louisa's unfortunate accident on the Cobb has cast a shadow over our stay, yet it has also revealed much about the character of those around us.</p>
                    <p>Captain Wentworth's concern for her was evident, yet I could not help but feel a pang of... what? Not jealousy, surely. Perhaps merely a reflection on what might have been, had circumstances been different.</p>
                `
            },
            {
                pageNum: 14,
                img: "img/persuasion/p.14.jpg",
                transcription: `
                    <p>Bath is as crowded and superficial as ever. I find myself longing for the simple pleasures of Uppercross, despite the frequent complaints of my sisters. The social whirl here is exhausting, and the constant attention to rank and fortune is wearying to the soul.</p>
                    <p>I saw Mr. Elliot in the Pump Room today. He is a man of undeniable charm and elegance, yet there is something about his character that remains opaque to me. I cannot quite trust the ease with which he navigates these social waters.</p>
                `
            },
            {
                pageNum: 15,
                img: "img/persuasion/p.15.jpg",
                transcription: `
                    <p>I can no longer listen in silence. I must speak to you by such means as are within my reach. You pierce my soul. I am half agony, half hope. Tell me not that I am too late, that such precious feelings are gone for ever. I offer myself to you again with a heart even more your own than when you almost broke it, eight years and a half ago.</p>
                    <p>I have loved none but you. Unjust I may have been, weak and resentful I have been, but never inconstant. You alone have brought me to Bath. For you alone, I think and plan. Have you not seen this? Can you fail to have understood my wishes?</p>
                `
            }
        ];

        let currentManuscriptPage = 0;

        function updateManuscriptPage() {
            manuscriptImg.style.opacity = 0;
            transcriptionText.style.opacity = 0;

            setTimeout(() => {
                const data = manuscriptPages[currentManuscriptPage];
                manuscriptImg.src = data.img;
                transcriptionText.innerHTML = data.transcription;
                if (pageNumDisplay) pageNumDisplay.innerText = data.pageNum;

                manuscriptImg.style.opacity = 1;
                transcriptionText.style.opacity = 1;

                if (manuscriptPrevBtn) manuscriptPrevBtn.disabled = currentManuscriptPage === 0;
                if (manuscriptNextBtn) manuscriptNextBtn.disabled = currentManuscriptPage === manuscriptPages.length - 1;
            }, 300);
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

        updateManuscriptPage();
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

    /* --- Faceted Research Logic --- */
    const facetedToggle = document.getElementById('faceted-toggle');
    const facetedDropdown = document.getElementById('faceted-dropdown');
    const categoryToggles = document.querySelectorAll('.category-toggle');
    const clearFiltersBtn = document.getElementById('clear-filters');

    if (facetedToggle && facetedDropdown) {
        facetedToggle.addEventListener('click', () => {
            facetedDropdown.classList.toggle('active');
            facetedToggle.classList.toggle('faceted-toggle-active');
        });

        // Toggle sub-categories
        categoryToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const group = toggle.parentElement;
                group.classList.toggle('active');
            });
        });

        // Clear filters
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                const checkboxes = facetedDropdown.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = false);
            });
        }
    }
});

/* --- Guided Tour Manager --- */
class GuideManager {
    constructor() {
        this.steps = [
            {
                id: 'step1',
                page: 'index.html',
                target: '.logo-container img',
                text: 'For a better experience, let us guide you through the Semantic Austen Digital Library.',
                point: 'point-top-left',
                button: 'Continue',
                position: (rect) => ({
                    top: rect.bottom + 15,
                    left: rect.left + rect.width / 4
                })
            },
            {
                id: 'step2',
                page: 'index.html',
                target: '.collection-link',
                text: 'click here.',
                point: 'point-top',
                button: null,
                position: (rect) => ({
                    top: rect.bottom + 20,
                    left: rect.left + rect.width / 2 - 140
                })
            },
            {
                id: 'step3',
                page: 'collection.html',
                target: '.collection-card[href="persuasion.html"] .card-caption h4',
                text: 'click here.',
                point: 'point-top',
                button: null,
                position: (rect) => ({
                    top: rect.bottom + 10,
                    left: rect.left + rect.width / 2 - 140
                })
            }
        ];

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (currentPage === 'index.html') {
            localStorage.removeItem('guideStep');
            localStorage.removeItem('guideClosed');
        }

        this.currentStepIndex = parseInt(localStorage.getItem('guideStep')) || 0;
        this.isClosed = localStorage.getItem('guideClosed') === 'true';

        if (!this.isClosed) {
            this.init();
        }
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => this.showStep(), 300);
        });
        window.addEventListener('resize', () => this.updatePosition());
    }

    async showStep() {
        const step = this.steps[this.currentStepIndex];
        if (!step) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (step.page !== currentPage) return;

        const targetEl = document.querySelector(step.target);
        if (!targetEl) return;

        if (step.id === 'step3') {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        this.createPopup(step, targetEl);
    }

    createPopup(step, targetEl) {
        this.removePopup();

        const popup = document.createElement('div');
        popup.className = `guide-popup ${step.point} guide-popup-active`;
        popup.id = 'guide-popup';

        const rect = targetEl.getBoundingClientRect();
        const pos = step.position(rect);

        popup.style.top = `${pos.top + window.scrollY}px`;
        popup.style.left = `${pos.left + window.scrollX}px`;

        let contentHtml = `
            <button class="guide-close" id="guide-close-btn" aria-label="Close guide">×</button>
            <div class="guide-content">
                <p>${step.text}</p>
        `;

        if (step.button) {
            contentHtml += `<button class="guide-btn" id="guide-continue-btn">${step.button}</button>`;
        }

        contentHtml += `</div>`;
        popup.innerHTML = contentHtml;

        document.body.appendChild(popup);

        document.getElementById('guide-close-btn').onclick = (e) => {
            e.stopPropagation();
            this.closeGuide();
        };

        if (step.button) {
            document.getElementById('guide-continue-btn').onclick = (e) => {
                e.stopPropagation();
                this.nextStep();
            };
        }

        if (!step.button) {
            const handleTargetClick = () => {
                this.nextStep();
            };
            targetEl.addEventListener('click', handleTargetClick, { once: true });
        }
    }

    nextStep() {
        this.currentStepIndex++;
        if (this.currentStepIndex < this.steps.length) {
            localStorage.setItem('guideStep', this.currentStepIndex);
            this.showStep();
        } else {
            this.completeGuide();
        }
    }

    updatePosition() {
        const popup = document.getElementById('guide-popup');
        if (!popup) return;

        const step = this.steps[this.currentStepIndex];
        const targetEl = document.querySelector(step.target);
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const pos = step.position(rect);

        popup.style.top = `${pos.top + window.scrollY}px`;
        popup.style.left = `${pos.left + window.scrollX}px`;
    }

    removePopup() {
        const popup = document.getElementById('guide-popup');
        if (popup) popup.remove();
    }

    closeGuide() {
        this.removePopup();
        localStorage.setItem('guideClosed', 'true');
        this.isClosed = true;
    }

    completeGuide() {
        this.removePopup();
        localStorage.setItem('guideClosed', 'true');
        localStorage.removeItem('guideStep');
        this.isClosed = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.guideManager = new GuideManager();
});
