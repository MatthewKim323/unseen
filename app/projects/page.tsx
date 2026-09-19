import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Nocturne Studio®",
};

// The project grid itself is WebGL (ProjectMenu scene); this body only carries the end-of-grid CTA.
export default function ProjectsPage() {
  return (
    <main
      {...{ asscroll: "" }}
      data-router-view="projects"
      role="main"
      itemScope
      itemProp="mainContentOfPage"
    >
      <h1 className="absolute z-negative" style={{ opacity: 0.001 }}>
        Projects
      </h1>
      <div className="project-grid-cta | js-project-grid-cta">
        <p>Looking for a creative partner for your project?</p>
        <a
          href="mailto:projects@nocturne.studio"
          target="_blank"
          title="projects@nocturne.studio"
          className="btn btn--regular btn--fill btn--dark js-btn"
          data-btn="fill"
          data-cursor="hide"
        >
          <span className="btn__inner js-btn-inner">
            <span className="btn__content js-btn-content">
              <span className="d-flex flex-row items-end">
                <span className="btn__text">projects@nocturne.studio</span>
                <svg className="btn__icon d-inline-block js-btn-icon">
                  <use href="#arrow"></use>
                </svg>
              </span>
            </span>
          </span>
        </a>
      </div>
    </main>
  );
}
