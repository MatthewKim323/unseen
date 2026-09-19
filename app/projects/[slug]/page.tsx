// Project detail page (source route /projects/<slug>/, data-router-view="project").
// Markup mirrors the source template: header (WebGL titles + model), overview, flexible content blocks
// (stored as rewritten HTML), and the next-project footer the engine turns into the overscroll transition.
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const DATA_DIR = path.join(process.cwd(), "lib/data/project-details");

interface ProjectDetail {
  slug: string;
  title: string;
  description: string;
  bodyClass: string;
  lightMode: boolean;
  currentProjectMenuId: number;
  bgColor: string;
  clientLine: string;
  header: {
    projectsText: string;
    title: string;
    description1: string;
    description2: string;
    model: { src: string; scale: string | null };
  };
  overview: {
    heading: string;
    html: string;
    servicesLabel: string;
    servicesHtml: string;
    button: { href: string; title: string; label: string; variant: "light" | "dark" } | null;
    details: { label: string; html: string }[];
  };
  blocksHtml: string;
  footer: {
    nextLink: string;
    nextLightMode: string;
    nextColor: string;
    footerNextColor: string;
    keepScrollingColor: string;
    nextTitle: string;
    progressColor: string;
    progressNextColor: string;
    nextModel: { src: string; scale: string | null; lightMode: string };
    nextBgColor: string;
    planeNextBgColor: string;
  };
}

function slugs(): string[] {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, "index.json"), "utf8"));
}

function load(slug: string): ProjectDetail | null {
  if (!slugs().includes(slug)) return null;
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), "utf8"));
}

export const dynamicParams = false;

export function generateStaticParams() {
  return slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = load(slug);
  if (!p) return {};
  return { title: p.title, description: p.description };
}

// Custom attributes the engine reads (dom2webgl, animate-from, asscroll) pass straight through to the DOM.
type Attrs = Record<string, string | number | boolean | undefined>;
const a = (attrs: Attrs) => attrs as React.HTMLAttributes<HTMLElement>;

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = load(slug);
  if (!p) notFound();
  const { header: h, overview: ov, footer: ft } = p;

  return (
    <main
      {...a({ asscroll: "" })}
      data-router-view="project"
      data-body-class={p.bodyClass}
      role="main"
      itemScope
      itemProp="mainContentOfPage"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <script dangerouslySetInnerHTML={{ __html: `document.body.className=${JSON.stringify(p.bodyClass)};` }} />
      <div className="absolute center-x top mt-6 mt-3@sm">
        <p className="t-uppercase t-500 t-lh-1.1 t-center" dangerouslySetInnerHTML={{ __html: p.clientLine }} />
      </div>

      <div className="container relative pt-10" data-bgcolor={p.bgColor}>
        <div className="relative mb-6">
          <div className="t-center t-left@sm js-project-header">
            <div className="t-uppercase mb-2">
              <div className="pl-0.25 pl-0.75@sm">
                <h2
                  className="d-inline-block t-serif t-italic m-0 t-3 t-6@md t-normal t-lh-1 t-ls-tighter js-projects-text"
                  {...a({ dom2webgl: "c:WebGLText" })}
                >
                  {h.projectsText}
                </h2>
              </div>
              <div className="relative t-center@sm">
                <h1
                  className="d-inline-block t-sans m-0 t-3 t-6@md t-normal t-lh-1 t-ls-tighter js-current-title"
                  {...a({ dom2webgl: "c:WebGLText" })}
                >
                  {h.title}
                </h1>
              </div>
            </div>
            <div className="t-uppercase mb-2 absolute top w-1/1" style={{ visibility: "hidden" }}>
              <div className="pl-0.25 pl-0.75@sm">
                <span className="d-inline-block t-serif t-italic m-0 t-3 t-6@md t-normal t-lh-1 t-ls-tighter">
                  {h.projectsText}
                </span>
              </div>
              <div className="relative t-center@sm">
                <span
                  className="d-inline-block t-sans m-0 t-3 t-6@md t-normal t-lh-1 t-ls-tighter js-next-title-position"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="t-uppercase offset-7/12@sm">
              <div>
                <p
                  className="d-inline-block t-sans m-0 t-3 t-6@md t-normal t-lh-0.9 t-ls-tighter js-description1"
                  {...a({ dom2webgl: "c:WebGLText" })}
                >
                  {h.description1}
                </p>
              </div>
              <div>
                <p
                  className="d-inline-block t-serif t-italic m-0 t-3 t-6@md t-normal t-lh-1 t-ls-tighter js-description2"
                  {...a({ dom2webgl: "c:WebGLText" })}
                >
                  {h.description2}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute center-x top w-2/3 w-5/12@sm pointer-events-none">
            <div className="aspect aspect--1/1">
              <div
                className="js-current-model aspect__child"
                {...a({ dom2webgl: "c:ProjectModel", "data-src": h.model.src, "data-scale": h.model.scale ?? undefined })}
              />
            </div>
          </div>
        </div>

        <div className="d-flex@sm mb-5 mb-10@sm relative">
          <div
            className="w-1/1 w-1/2@sm pr-2@sm pr-4@md relative mb-2 mb-0@sm visible"
            {...a({ dom2webgl: "c:TextReveal", "animate-from": "preset: 'webglTextReveal'" })}
          >
            <h2
              className="t-small t-uppercase t-500"
              {...a({ "animate-from": "autoAlpha: 0, duration: 0.1" })}
              dangerouslySetInnerHTML={{ __html: ov.heading }}
            />
            <p
              className="t-1 t-2@sm t-300 t-lh-1.3"
              {...a({ "animate-from": "autoAlpha: 0, duration: 0.1" })}
              dangerouslySetInnerHTML={{ __html: ov.html }}
            />
          </div>
          <div className="w-1/1 w-5/12@sm pl-2@sm pl-0@md offset-1/12@sm">
            <div
              className="d-flex flex-wrap"
              {...a({ "animate-from": "autoAlpha: 0, stagger: 0.1, delay: 0.6, ease: 'sine.out'" })}
            >
              <div className="w-1/2 mb-3@sm">
                <h2 className="mb-0.5 t-small t-uppercase t-500" dangerouslySetInnerHTML={{ __html: ov.servicesLabel }} />
                <ul
                  className="m-0 p-0 t-1.2 t-lh-1.3 t-500"
                  style={{ listStyleType: "none" }}
                  dangerouslySetInnerHTML={{ __html: ov.servicesHtml }}
                />
                {ov.button && (
                  <div className="w-1/1 mt-2">
                    <a
                      href={ov.button.href}
                      target="_blank"
                      title={ov.button.title}
                      className={`btn btn--regular btn--fill btn--${ov.button.variant}  js-btn`}
                      data-btn="fill"
                      data-cursor="hide"
                    >
                      <span className="btn__inner js-btn-inner">
                        <span className="btn__content js-btn-content">
                          <span className="d-flex flex-row items-end">
                            <span className="btn__text">{ov.button.label}</span>
                            <svg className="btn__icon d-inline-block js-btn-icon">
                              <use href="#arrow" />
                            </svg>
                          </span>
                        </span>
                      </span>
                    </a>
                  </div>
                )}
              </div>
              <div className="w-1/2 mb-3@sm">
                {ov.details.map((d, i) => (
                  <div className="mb-1" key={i}>
                    <h2 className="mb-0.25 t-small t-uppercase t-500" dangerouslySetInnerHTML={{ __html: d.label }} />
                    <p className="m-0 p-0 t-1.2 t-lh-1.1 t-500" dangerouslySetInnerHTML={{ __html: d.html }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: p.blocksHtml }} />

      <div
        className="relative d-flex justify-center items-center mt-10 js-footer"
        style={{ height: "calc(100 * var(--vh))" }}
        data-next-link={ft.nextLink}
        data-next-light-mode={ft.nextLightMode}
      >
        <div className="t-center container">
          <span
            className="t-serif t-uppercase t-3 t-6@md t-normal m-0 t-lh-1 js-footer-next"
            {...a({ dom2webgl: "c:ProjectTransitionText", "data-next-color": ft.footerNextColor })}
          >
            Next
          </span>
          <h2
            className="t-sans t-uppercase t-3 t-6@md t-normal m-0 t-lh-1 t-ls-tighter mb-2 js-next-title"
            {...a({ dom2webgl: "c:ProjectTransitionText", "data-next-color": ft.nextColor })}
          >
            {ft.nextTitle}
          </h2>
          <span
            className="t-sans t-uppercase t-1.3 t-normal t-lh-1 js-keep-scrolling"
            {...a({ dom2webgl: "c:ProjectTransitionText", "data-next-color": ft.keepScrollingColor })}
          >
            (Keep Scrolling)
          </span>
          <div
            className="mt-0.25 js-scroll-progress"
            {...a({
              dom2webgl: "c:ProjectScrollProgress",
              "data-color": ft.progressColor,
              "data-next-color": ft.progressNextColor,
            })}
          />
        </div>
        <div className="container d-flex justify-center items-center absolute">
          <div className="w-2/3 w-5/12@sm pointer-events-none">
            <div className="aspect aspect--1/1">
              <div
                className="aspect__child js-next-model"
                {...a({
                  dom2webgl: "c:ProjectModel",
                  "data-src": ft.nextModel.src,
                  "data-scale": ft.nextModel.scale ?? undefined,
                  "data-transition": "",
                  "data-light-mode": ft.nextModel.lightMode,
                  "data-next-bgcolor": ft.nextBgColor,
                })}
              />
            </div>
          </div>
        </div>
        <div
          className="absolute w-1/1 h-100vh js-transition-plane"
          {...a({ dom2webgl: "c:ProjectTransition", "data-next-bgcolor": ft.planeNextBgColor })}
        />
      </div>
      <script dangerouslySetInnerHTML={{ __html: `window.currentProjectMenuId = ${p.currentProjectMenuId}` }} />
    </main>
  );
}
