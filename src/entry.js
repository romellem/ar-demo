import { wrapGrid } from 'animate-css-grid';
import './css/index.scss';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

const HEADER_AND_PADDING_AND_GAP = 60 + 16 + 4;

const wrapGridConfigured = (grid, tab) => {
  return wrapGrid(grid, {
    duration: 500,
    onEnd: () => {
      const selected_cell = tab.querySelector('.cell--selected');
      const parent_cell_rect = selected_cell.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = parent_cell_rect.top + scrollTop - HEADER_AND_PADDING_AND_GAP;

      window.scrollTo({
        left: 0,
        top,
        behavior: 'smooth',
      });
    },
  });
};

function ready(fn) {
  if (
    document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/**
 * @param {Element} element
 * @param {String} event_type
 * @param {Function} callback
 * @returns {Function} Returns a 'destroy' function to immediately remove the event listener
 */
const once = (element, event_type, callback) => {
  // Purposefuly don't use an arrow function so `this` can get binded correctly
  const callbackWithRemove = function (event) {
    element.removeEventListener(event_type, callbackWithRemove);
    callback.call(this, event);
  };
  element.addEventListener(event_type, callbackWithRemove);

  // Returns a 'destroy' function that when run, immediately removes the event.
  const destroy = () => element.removeEventListener(event_type, callbackWithRemove);
  return destroy;
};

ready(() => {
  const $ = (s, c) => (c ? c.querySelector(s) : document.querySelector(s));
  const $$ = (s, c) => (c ? c.querySelectorAll(s) : document.querySelectorAll(s));

  function initTabs(initial_id = 1) {
    const tabs = $$('.tabs');
    tabs.forEach((tab) => {
      tab.dataset.tabSelected = initial_id.toString();
      const wrapped_grids = [];
      tab.unwrapAllGrids = () => {
        wrapped_grids.forEach((wrapped_grid) => {
          wrapped_grid?.unwrapGrid?.();
        });
      };

      const labels = $$('.tabs__label', tab);

      labels.forEach((label) => {
        const tab_label_id = label.dataset.tabLabel;

        const grid = $(`[data-tab="${tab_label_id}"] .grid`, tab);
        const { unwrapGrid, forceGridAnimation } = wrapGridConfigured(grid, tab);

        wrapped_grids.push({
          grid,
          unwrapGrid,
          forceGridAnimation,
        });

        const rewrapGrid = (grid) => {
          let [wrapped_grid_reference] = wrapped_grids.filter((ref) => ref.grid === grid);
          const { unwrapGrid, forceGridAnimation } = wrapGridConfigured(grid, tab);
          wrapped_grid_reference.unwrapGrid = unwrapGrid;
          wrapped_grid_reference.forceGridAnimation = forceGridAnimation;
        };

        label.onclick = function () {
          // Don't rewrap if we're already selected
          if (!tab.dataset.tabSelected !== tab_label_id) {
            tab.dataset.tabSelected = tab_label_id;

            tab.unwrapAllGrids();
            rewrapGrid(grid);
          }
        };
      });
    });
  }

  function wrapGrids() {
    const grids = $$('.grid');
    grids.forEach((grid) => {
      const cells = $$('.cell', grid);
      cells.forEach((cell) => {
        let preview_buttons = $$('[data-ar]', cell);
        preview_buttons.forEach((button) => {
          button.addEventListener('click', function (e) {
            let ars = $$('.ar');
            let ar_id = this.dataset.ar;
            let parent_ar = button.closest('.ar');
            ars.forEach((el) => el.removeAttribute('data-ar-selected'));
            parent_ar.setAttribute('data-ar-selected', ar_id);

            // Animate cell
            $('.cell--selected')?.classList.remove('cell--selected');
            let parent_cell = button.closest('.cell');
            parent_cell.classList.add('cell--selected');
          });
        });

        let front_back_buttons = $$('.card__front-back-button', cell);
        front_back_buttons.forEach((button) => {
          button.addEventListener('click', function (e) {
            let parent_ar = button.closest('.ar');
            parent_ar.removeAttribute('data-ar-selected');

            // Close cell
            let parent_cell = button.closest('.cell');
            parent_cell.classList.remove('cell--selected');
          });
        });

        let card_flip_buttons = $$('.card__front-button', cell);
        card_flip_buttons.forEach((button) => {
          let parent_card = button.closest('.card');
          button.onclick = function () {
            // Fix height
            const parent_card_rect = parent_card.getBoundingClientRect();
            parent_card.style.height = `${parent_card_rect.height}px`;

            // Save original height so we can use it when flipping back
            // Is this bad for resopnsive stuff? Should I just remeasure?
            parent_card.dataset.originalHeight = parent_card_rect.height;

            // Start rotation
            parent_card.classList.toggle('card--selected');
            parent_card.dataset.cardFlippedId = button.dataset.cardFlipId;

            // Force a reflow to start the transition
            void parent_card.offsetTop;

            // Set height to card selection
            const card_selected = $(
              `.card__selection[data-grade-id="${button.dataset.cardFlipId}"]`,
              parent_card,
            );
            const card_selected_rect = card_selected.getBoundingClientRect();
            parent_card.style.height = `${card_selected_rect.height}px`;

            /**
             * @todo handle resizes
             */
          };
        });

        let card_selection_back_buttons = $$('.card__selection-back-button', cell);
        card_selection_back_buttons.forEach((button) => {
          let parent_card = button.closest('.card');
          button.onclick = function () {
            // Revert height
            const original_height = parent_card.dataset.originalHeight;
            parent_card.style.height = `${original_height}px`;

            // Start rotation
            parent_card.classList.remove('card--selected');

            // Force a reflow to start the transition
            void parent_card.offsetTop;

            // Remove inline height
            once(parent_card, 'transitionend', (e) => {
              parent_card.style.height = '';

              // Make it display: none
              parent_card.removeAttribute('data-card-flipped-id');
            });
          };
        });
      });
    });
  }

  initTabs();
  wrapGrids();
});
