import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World | Nocturne Studio®",
};

// window.worldData (source inline script) is filled by the World scene from lib/data/world.json.

export default function WorldPage() {
  return (
    <main
      {...{ asscroll: "" }}
      data-router-view="world"
      role="main"
      itemScope
      itemProp="mainContentOfPage"
    >
      <h1 className="pointer-events-none user-select-none">Nocturne World</h1>
      <div className="world-details | js-details">
        <div className="world-details__title-wrap | js-details-title-wrap">
          <h2 className="world-details__title | js-details-title"></h2>
        </div>
        <div className="js-details-meta">
          <div className="world-details__author | js-details-author-wrap">
            <div className="mb-1">
              <span>By&nbsp;</span>
              <span className="js-details-author"></span>
            </div>
          </div>
          <div className="world-details__caption t-sans t-uppercase mb-1 | js-details-caption"></div>
          <a
            href="#"
            title="View more"
            className="btn btn--regular btn--fill btn--light world-details__btn js-details-btn js-btn"
            data-btn="fill"
            data-cursor="hide"
          >
            <span className="btn__inner js-btn-inner">
              <span className="btn__content js-btn-content">
                <span className="d-flex flex-row items-end">
                  <span className="btn__text">View more</span>
                  <svg className="btn__icon d-inline-block js-btn-icon">
                    <use href="#arrow"></use>
                  </svg>
                </span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}
