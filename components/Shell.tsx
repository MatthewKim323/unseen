// Persistent shell markup (reference/site/css/markup/shell.html, same classes and hooks).
// Order in <body>: <Shell/> (loader, naked-loader, header, menu, click-catcher, cursor, footer),
// then the router wrapper with the route <main>, then <ShellPost/> (gl canvas, world intro,
// project filters, #p-cover, asscrollbar, height-div). Engine classes in lib/engine/dom query these hooks.
import Sprite from "./Sprite";

// Cube faces: 6 faces for an 8 letter brand. Faces reveal in DOM order 1,2,3,4,6,5, so the DOM order
// N,O,C,T,R,U shows N-O-C-T-U-R and the 4s loop wraps back to N, reading "NOCTUR(N)..." continuously.
const CUBE = ["N", "O", "C", "T", "R", "U"];

const TAGLINE = (
  <p className="loader__tagline">
    A brand, digital and motion studio creating
    <br />
    refreshingly unexpected ideas and striking visuals
    <br />
    that help bold brands cut through the noise.
  </p>
);

function Eyes() {
  return (
    <svg
      width="311.3"
      height="233.3"
      className="loader__eyes | js-eyes"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 311.3 233.3"
    >
      <defs>
        <clipPath id="mask-left">
          <path
            className="eyes-st1"
            d="M139.5,101.5c2.5-7.8,6-14.8,10.3-21c0-0.1-0.1-0.2-0.1-0.3c-3.8-11.2-11.1-19-20.6-22 c-2.8-0.9-5.6-1.3-8.5-1.3c-7,0-14.2,2.5-21,7.5C89.8,71.3,82.2,82.4,78,95.5c-4.1,13.1-4.3,26.5-0.4,37.9 c3.8,11.2,11.1,19,20.6,22c9.4,3,19.9,0.8,29.5-6.1c3.5-2.5,6.7-5.6,9.6-9.1C134.6,128,135.3,114.6,139.5,101.5z"
          />
        </clipPath>
        <clipPath id="mask-right">
          <path
            className="eyes-st1"
            d="M206,58.9c-3.8-1.2-7.6-1.8-11.4-1.8c-21.7,0-43.6,18.2-52.2,45.3c-4.9,15.5-4.8,31.6,0.3,45.3 c5.1,13.6,14.5,23.1,26.6,27c12,3.8,25.3,1.4,37.2-6.7c12.1-8.2,21.5-21.3,26.4-36.8C243,99.2,230.9,66.8,206,58.9z"
          />
        </clipPath>
      </defs>
      <g className="left-container">
        <ellipse
          transform="matrix(0.3023 -0.9532 0.9532 0.3023 -22.508 182.8248)"
          className="eyes-st0"
          cx="113.6"
          cy="106.8"
          rx="52.5"
          ry="38.8"
        />
      </g>
      <g clipPath="url(#mask-left)">
        <g className="js-eyes-left">
          <g className="js-eyes-normal">
            <ellipse
              transform="matrix(0.2938 -0.9559 0.9559 0.2938 -24.3184 186.5732)"
              cx="114.1"
              cy="109.7"
              rx="33"
              ry="23.5"
            />
            <circle className="eyes-st1" cx="132.6" cy="120.7" r="11" />
          </g>
          <path
            className="js-eyes-heart eyes-st4"
            d="M131.8,98.8c-0.9-2.8-3-5.3-5.8-6.2c-4.1-1.3-9.1,1.2-11.5,4.6c-1.5,2.1-2.1,4.6-2.9,7 c-0.2,0.8-0.8,4-1.8,2.2c-2.2-3.7-6.4-6.2-10.7-4.7c-3.2,1.1-5.2,4.3-5.9,7.4c-1,5,1.4,9.9,4.9,13.4c2.6,2.6,5.7,4.6,8.9,6.5 c1.7,1,3.6,1.7,5.2,2.8c1.4,1,4.1,5.8,5.4,3.1c1.1-2.4,1.6-5.1,3-7.4c1.5-2.6,3.4-5,5.1-7.5c3.3-4.7,6.8-9.8,6.9-15.8 C132.7,102.5,132.5,100.6,131.8,98.8z"
          />
        </g>
        <rect className="js-eyes-eyelid-left-top eyes-st3" x="62.9" y="22.3" width="103.2" height="78.5" />
        <rect className="js-eyes-eyelid-left-bottom eyes-st3" x="65.1" y="125.7" width="89.3" height="78.5" />
      </g>
      <g className="right-container">
        <ellipse
          transform="matrix(0.3023 -0.9532 0.9532 0.3023 19.5634 260.2873)"
          className="eyes-st0"
          cx="187.6"
          cy="116.8"
          rx="62.3"
          ry="49"
        />
      </g>
      <g clipPath="url(#mask-right)">
        <g className="js-eyes-right">
          <g className="js-eyes-normal">
            <ellipse
              transform="matrix(0.2938 -0.9559 0.9559 0.2938 23.4151 259.1791)"
              cx="187.1"
              cy="113.7"
              rx="35.9"
              ry="25.6"
            />
            <circle className="eyes-st1" cx="208.6" cy="121.7" r="11" />
          </g>
          <path
            className="js-eyes-heart eyes-st4"
            d="M158.8,104.8c0.1-7,5.7-13.4,13.1-12.3c2.6,0.4,4.9,1.7,6.8,3.4c1.2,1.1,4,7.1,5.5,4.2 c2.4-4.8,7.4-9,12.8-9.9c6.5-1.1,11.6,3.8,12.9,9.9c1.6,7.7-3.9,14.6-8.8,19.9c-5.7,6.1-12.8,11.8-15.3,20 c-1.5,4.8-3.8-0.8-5.1-2.8c-1.7-2.6-4-4.7-6.3-6.7c-4.7-4.3-10-8.5-12.9-14.3C160,113,158.8,108.8,158.8,104.8z"
          />
        </g>
        <rect className="js-eyes-eyelid-right-top eyes-st3" x="130.6" y="22.3" width="117.6" height="78.5" />
        <rect className="js-eyes-eyelid-right-bottom eyes-st3" x="127.5" y="125.7" width="117.6" height="78.5" />
      </g>
    </svg>
  );
}

function Loader() {
  return (
    <div className="loader loader--animate js-loader">
      <div className="loader__inner">
        <div className="loader__wrap js-loader-box">
          <div className="loader__box">
            {CUBE.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
        <span className="loader__title">Nocturne Studio®</span>
        {TAGLINE}
      </div>
      <button className="loader__btn js-enter-no-audio-btn">
        Enter without audio<span></span>
        <span></span>
      </button>
      <div className="loader__progress js-loader-progress">
        <div className="js-loader-progress-inner">
          <div className="loader__inner">
            <div className="loader__wrap js-loader-box">
              <div className="loader__box loader__box--pink">
                {CUBE.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>
            <div className="loader__eyes-container">
              <Eyes />
            </div>
            <span className="loader__title">Nocturne Studio®</span>
            {TAGLINE}
            <button
              className="btn btn--regular btn--fill btn--light js-btn js-enter-btn"
              data-btn="fill"
              data-cursor="hide"
            >
              <span className="btn__inner js-btn-inner">
                <span className="btn__content js-btn-content">
                  <span className="d-flex flex-row items-end">
                    <span className="btn__text">Enter</span>
                    <svg className="btn__icon d-inline-block js-btn-icon">
                      <use href="#arrow"></use>
                    </svg>
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NakedLoader() {
  return (
    <div className="naked-loader js-naked-loader">
      <div className="loader__inner">
        <div className="loader__wrap js-naked-loader-wrap">
          <div className="loader__box">
            {CUBE.map((l, i) => (
              <div key={i} className="js-naked-loader-box">
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="naked-loader__text absolute t-sans t-uppercase t-1.3 t-normal t-lh-1 js-naked-loader-text">
        <div>(Loading)</div>
      </div>
    </div>
  );
}

// Placeholder wordmark at the reference logo viewBox (1263.3 x 159.6); CSS sizes it 13.2rem x 1.7rem.
function Logo() {
  return (
    <svg viewBox="0 0 1263.3 159.6" xmlns="http://www.w3.org/2000/svg" aria-label="Nocturne Studio">
      <text
        x="0"
        y="157"
        fontSize="214"
        fontFamily="Neue Montreal, sans-serif"
        textLength="1263.3"
        lengthAdjust="spacingAndGlyphs"
      >
        NOCTURNE
      </text>
    </svg>
  );
}

const NAV = [
  { href: "/", label: "Index", extra: " js-nav-home", hoverStyle: undefined },
  { href: "/projects", label: "Projects", extra: "", hoverStyle: { paddingLeft: "0.1rem" } },
  { href: "/contact", label: "Contact", extra: " js-nav-contact", hoverStyle: undefined },
];

function Header() {
  return (
    <header className="header fixed d-flex items-center w-1/1 p-1 px-2@sm z-80 justify-center justify-between@sm">
      <div className="header__logo d-flex absolute relative@sm items-center flex-no-shrink h-1/1 pointer-events-none">
        <a href="/" className="d-block pointer-events-auto" data-cursor="hide" title="Nocturne Studio Home">
          <Logo />
        </a>
      </div>
      <div className="d-flex justify-end items-center w-1/1 w-auto@sm js-navigation">
        <nav className="overflow-hidden d-block js-nav-inner" data-cursor="navWrapper">
          <div className="d-none d-flex@sm align-center justify-end">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={"nav-item js-nav-item" + n.extra}
                data-cursor="navItem"
                data-audio-enter="audio.ratchet"
                aria-label={n.label}
                title={n.label}
              >
                <div className="relative">
                  <div className="nav-item__text t-lh-1.1 t-1.2 js-nav-item-text">{n.label}</div>
                  <div
                    className="nav-item__text--hover t-lh-0.9 absolute t-serif t-1.3 t-italic js-nav-item-hover-text"
                    style={n.hoverStyle}
                  >
                    {n.label}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </nav>
        <button
          className="btn btn--circle menu-btn d-flex js-menu-toggle"
          data-cursor="hide"
          data-audio-enter="audio.hover"
        >
          <span className="sr">Toggle Menu</span>
          <div className="btn__bg absolute d-block menu-btn__bg js-menu-toggle-bg"></div>
          <svg viewBox="0 0 14 5" className="btn__icon menu-btn__icon relative js-menu-icon" fill="none">
            <circle cx="2.4" className="js-menu-icon-circle" cy="2.4" r="2.4" fill="#212121" />
            <circle cx="11.6" className="js-menu-icon-circle" cy="2.4" r="2.4" fill="#212121" />
          </svg>
          <div className="btn__inner menu-btn__inner absolute">
            <span className="btn__inner-bg menu-btn__inner-bg js-menu-toggle-inner-bg"></span>
            <svg className="btn__inner-icon menu-btn__inner-icon js-menu-toggle-inner-icon">
              <use href="#close"></use>
            </svg>
          </div>
        </button>
      </div>
    </header>
  );
}

const MENU = [
  { href: "/", label: "Index", num: "01", extra: " js-nav-home", serif: true },
  { href: "/projects", label: "Projects", num: "02", extra: "", serif: true },
  { href: "/contact", label: "Contact", num: "03", extra: " js-nav-contact", serif: true },
  { href: "/world", label: "World", num: "04", extra: "", serif: false },
];

const SOCIALS = [
  { label: "Twitter", href: "https://twitter.com/nocturne" },
  { label: "Instagram", href: "https://www.instagram.com/nocturne/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/nocturne" },
  { label: "Dribbble", href: "https://dribbble.com/nocturne" },
  { label: "Behance", href: "https://www.behance.net/nocturne" },
];

function ArrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span>
      <span>
        <span>{"⮡ "}</span>
      </span>
      {children}
    </span>
  );
}

function Menu() {
  return (
    <>
      <div className="menu open overflow-hidden fixed z-70 h-1/1 js-menu">
        <div className="menu__inner absolute h-1/1 d-flex justify-center justify-start@lg items-center js-menu-inner">
          <div className="menu__nav d-flex items-start w-auto w-1/1@lg">
            {MENU.map((m) => (
              <a
                key={m.href}
                href={m.href}
                className={"menu__nav-item relative d-flex items-start js-menu-item" + m.extra}
                data-cursor="hide"
                aria-label={m.label}
                title={m.label}
              >
                <span className="menu__nav-number js-menu-number">{m.num}</span>
                <span className="menu__text t-ls-tighter relative js-menu-text">
                  {m.label}
                  <span className="menu__underline js-active-underline"></span>
                </span>
                <span
                  className={(m.serif ? "t-serif " : "") + "t-italic t-ls-tighter menu__hover-text js-menu-hover-text"}
                >
                  {m.label}
                </span>
                {m.label === "World" && (
                  <span className="menu__world js-menu-world-icon">
                    <svg>
                      <use href="#globe"></use>
                    </svg>
                  </span>
                )}
              </a>
            ))}
          </div>
          <div className="menu__footer absolute d-flex justify-between items-end">
            <div>
              <a
                className="d-block arrow-link js-menu-link"
                data-audio-enter="audio.ratchet"
                href="mailto:projects@nocturne.studio"
                data-cursor="hide"
              >
                <ArrowLabel>projects@nocturne.studio</ArrowLabel>
              </a>
              <a
                className="d-block arrow-link js-menu-link"
                data-audio-enter="audio.ratchet"
                href="tel:(+44) 0117 922 6892"
                data-cursor="hide"
              >
                <ArrowLabel>(+44) 0117 922 6892</ArrowLabel>
              </a>
            </div>
            <div className="overflow-hidden">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  className="social-link arrow-link js-social-links"
                  data-audio-enter="audio.ratchet"
                  href={s.href}
                  rel="nofollow"
                  target="_blank"
                  data-cursor="hide"
                >
                  <ArrowLabel>{s.label}</ArrowLabel>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed fill z-40 js-menu-wrapper" style={{ display: "none" }}></div>
    </>
  );
}

function Cursor() {
  return (
    <div className="cursor js-cursor">
      <div className="cursor__wrap js-cursor-wrap">
        <div className="cursor__inner js-cursor-inner">
          <span className="cursor__circle absolute fill js-cursor-circle"></span>
        </div>
        <span className="cursor__hold absolute fill">
          <span className="cursor__hold-inner absolute fill js-cursor-hold-inner"></span>
          <span className="cursor__hold-outer absolute fill js-cursor-hold-outer"></span>
        </span>
        <span className="cursor__video video-indicator video-indicator--cursor absolute fill">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="49" className="video-indicator__outer js-cursor-video-outer"></circle>
            <g className="js-cursor-video-icon">
              <path
                className="js-cursor-video-play"
                d="M58,49.1c0.7,0.4,0.7,1.3,0,1.7l-14.2,8.2c-0.7,0.4-1.5-0.1-1.5-0.9V41.8c0-0.8,0.8-1.3,1.5-0.9L58,49.1z"
                fill="#040404"
              />
              <g className="js-cursor-video-pause">
                <path d="M47.1,38.5h-4.2c-0.7,0-1.2,0.6-1.2,1.2v17.5c0,0.7,0.6,1.2,1.2,1.2h4.2c0.7,0,1.2-0.6,1.2-1.2V39.7 C48.3,39.1,47.8,38.5,47.1,38.5z" />
                <path d="M57.1,38.5h-4.2c-0.7,0-1.2,0.6-1.2,1.2v17.5c0,0.7,0.6,1.2,1.2,1.2h4.2c0.7,0,1.2-0.6,1.2-1.2V39.7 C58.3,39.1,57.8,38.5,57.1,38.5z" />
              </g>
            </g>
          </svg>
        </span>
        <span className="cursor__click-hold-prompt absolute fill | js-cursor-click-hold-prompt">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="14" y1="25" x2="34" y2="25" strokeWidth="2" />
            <line opacity="0.4" x1="16" y1="20" x2="32" y2="20" strokeWidth="2" />
            <line opacity="0.4" x1="16" y1="30" x2="32" y2="30" strokeWidth="2" />
            <circle cx="24" cy="24" r="23.5" />
          </svg>
          <span>
            <span>Click &amp; Hold</span>
          </span>
        </span>
        <span className="absolute fill cursor__drag | js-cursor-drag">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="49" className="video-indicator__outer"></circle>
          </svg>
          <svg
            className="cursor__drag__arrows"
            width="46"
            height="10"
            viewBox="0 0 46 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.1667 5.625H2.15333L5.32667 9.125L4.53333 10L0 5L4.53333 0L5.32667 0.875L2.15333 4.375H14.1667V5.625Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M31.0001 4.375L43.0134 4.375L39.8401 0.875L40.6334 -3.96317e-07L45.1667 5L40.6334 10L39.8401 9.125L43.0134 5.625L31.0001 5.625L31.0001 4.375Z"
              fill="black"
            />
          </svg>
        </span>
        <span className="absolute fill cursor__progress | js-cursor-progress">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle className="video-indicator__inner" cx="50" cy="50" r="39" stroke="#EAEAEA" />
            <circle
              className="video-indicator__progress js-cursor-progress-ring"
              style={{ transformOrigin: "center center" }}
              transform="rotate(-90)"
              cx="50"
              cy="50"
              r="39"
              stroke="#6D6D6D"
              strokeDasharray="244px"
              strokeDashoffset="244px"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <button
        className="btn btn--circle d-flex mute-btn js-mute mute-btn--global z-60 js-global-mute-btn"
        data-cursor="hide"
        data-audio-enter="audio.hover"
      >
        <span className="sr">Toggle Sound</span>
        <div className="btn__bg mute-btn__bg absolute d-block js-mute-bg"></div>
        <svg
          className="btn__icon mute-btn__icon absolute fill js-mute-icon"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 18 16"
          enableBackground="new 0 0 18 16"
          xmlSpace="preserve"
        >
          <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="1" y1="0" x2="1" y2="16" />
          <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="13" y1="0" x2="13" y2="16" />
          <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="5" y1="0" x2="5" y2="16" />
          <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="17" y1="0" x2="17" y2="16" />
          <line className="mute-btn__icon-line js-sound-line" strokeWidth="2" x1="9" y1="0" x2="9" y2="16" />
        </svg>
        <div className="btn__inner mute-btn__inner absolute">
          <span className="btn__inner-bg mute-btn__fill absolute fill js-mute-fill"></span>
        </div>
      </button>
      <div className="footer__cta z-50 fixed d-flex justify-center justify-start@md js-footer-cta">
        <a
          href="https://2025.nocturne.studio/"
          target="_blank"
          title="Our 2025 Wrapped"
          className="btn btn--regular btn--border btn--light js-rebrand-btn js-btn"
          data-btn="border"
          data-cursor="hide"
        >
          <span className="btn__inner js-btn-inner">
            <span className="btn__content js-btn-content">
              <span className="d-flex flex-row items-end">
                <span className="btn__text">Our 2025 Wrapped</span>
              </span>
            </span>
          </span>
        </a>
      </div>
      <a
        href="/world"
        className="btn btn--circle world-btn d-none d-flex@md z-50 js-world-btn"
        data-cursor="hide"
        data-audio-enter="audio.hover"
      >
        <div className="btn__bg world-btn__bg absolute js-world-inner-bg"></div>
        <svg className="btn__icon world-btn__icon absolute js-world-icon">
          <use href="#globe"></use>
        </svg>
        <div className="btn__inner world-btn__inner absolute z-40">
          <span className="btn__inner-bg world-btn__bg absolute js-world-btn-hover"></span>
          <svg className="btn__inner-icon world-btn__inner-icon absolute fill js-world-hover-icon">
            <use href="#globe"></use>
          </svg>
          <div className="world-btn__text absolute fill z-40">
            <div className="world-btn__text-left">
              <span className="t-uppercase js-world-text-left">Nocturne</span>
            </div>
            <div className="world-btn__text-right">
              <span className="t-uppercase js-world-text-right">World</span>
            </div>
          </div>
        </div>
      </a>
      <div className="footer__cr z-50 fixed d-none d-block@md js-footer-cr">&#169;2026</div>
    </div>
  );
}

export default function Shell() {
  return (
    <>
      <Sprite />
      <Loader />
      <NakedLoader />
      <Header />
      <Menu />
      <Cursor />
      <Footer />
    </>
  );
}

const FILTERS: [string, string][] = [
  ["all", "All"],
  ["branding", "Branding"],
  ["digital", "Digital"],
  ["motion", "Motion"],
  ["experiment", "Experiment"],
];

// Post-main globals. The CSS3D layer is created and appended to <body> by Gl (ARCH 6).
export function ShellPost() {
  return (
    <>
      <div className="fixed fill w-1/1 h-1/1 z-40 user-select-none pointer-events-none">
        <canvas id="gl"></canvas>
      </div>
      <div
        className="fixed top left w-1/1 h-1/1 d-flex items-center justify-center z-50 pointer-events-none user-select-none js-world-intro"
        style={{ visibility: "hidden" }}
      >
        <div className="world-intro">
          <div className="mb-1">
            <svg>
              <use href="#drag-globe"></use>
            </svg>
          </div>
          <div className="overflow-hidden">
            <p className="t-white t-center mb-0">Drag to explore our world</p>
          </div>
        </div>
      </div>
      <div className="project-filters | js-project-filters" style={{ visibility: "hidden", opacity: 0 }}>
        <div className="project-filters__overlay js-project-filters:overlay"></div>
        <div className="project-filters__inner | js-project-filters-inner">
          <h1 className="project-filters__title | t-sans t-offblack t-center t-ls--2">Selected Projects</h1>
          <div className="project-filters__filter | js-project-filters:filter">
            <div className="project-filters__filter__bg | pointer-events-none | js-project-filters:filterBg"></div>
            <button className="project-filters__filter__toggle d-none@md | js-project-filters:toggle">
              Filter
              <svg className="project-filters__filter__chevron js-project-filters:chevron">
                <use href="#chevron-down"></use>
              </svg>
            </button>
            <div className="project-filters__filter__list | js-project-filters:filterList">
              {FILTERS.map(([f, label], i) => (
                <button
                  key={f}
                  data-filter={f}
                  className={
                    "project-filters__filter__button | " + (i === 0 ? "is-active " : "") + "js-project-filters:filterBtn"
                  }
                >
                  {label}
                  <div className="js-project-filters:filter:number"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div id="p-cover"></div>
      <div className="asscrollbar">
        <div className="asscrollbar__handle">
          <div></div>
        </div>
      </div>
      <div className="height-div"></div>
    </>
  );
}
