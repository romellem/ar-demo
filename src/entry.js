import { wrapGrid } from 'animate-css-grid';

import './css/index.scss';

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

  // const grid = $('.grid');

  // $$('.cell').forEach(cell => cell.addEventListener('click', function() {
  //   if (this.classList.contains('selected')) {
  //     this.classList.remove('selected');
  //   } else {
  //     $('.selected')?.classList.remove('selected');
  //     this.classList.add('selected');
  //   }
  // }));

  // // {
  // //   // int: default is 0 ms
  // //   stagger: 100,
  // //   // int: default is 250 ms
  // //   duration: 500,
  // //   // string: default is 'easeInOut'
  // //   easing: 'backInOut',
  // //   // function: called with list of elements about to animate
  // //   onStart: (animatingElementList)=> {},
  // //   // function: called with list of elements that just finished animating
  // //   // cancelled animations will not trigger onEnd
  // //   onEnd: (animatingElementList)=> {}
  // // }

  // window.animateCSSGrid.wrapGrid(grid, {
  //   duration: 300,
  // });

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
        const { unwrapGrid, forceGridAnimation } = wrapGrid(grid, { duration: 500 });
        wrapped_grids.push({
          grid,
          unwrapGrid,
          forceGridAnimation,
        });

        const rewrapGrid = (grid) => {
          let [wrapped_grid_reference] = wrapped_grids.filter((ref) => ref.grid === grid);
          const { unwrapGrid, forceGridAnimation } = wrapGrid(grid, { duration: 500 });
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

  initTabs();

  function wrapGrids() {
    const grids = $$('.grid');
    grids.forEach((grid) => {
      const cells = $$('.cell', grid);
      cells.forEach((cell) => {
        let preview_buttons = $$('.ar__preview-button', cell);
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

        let card_flip_buttons = $$('.card__front-button', cell);
        card_flip_buttons.forEach((button) => {
          let parent_card = button.closest('.card');
          button.onclick = function () {
            // Fix height
            const parent_card_rect = parent_card.getBoundingClientRect();
            parent_card.style.height = `${parent_card_rect.height}px`;

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
      });
    });
  }

  wrapGrids();
});
