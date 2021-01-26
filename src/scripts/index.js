import { wrapGrid } from 'animate-css-grid';

import '../stylesheets/style.scss';

function ready(fn) {
  if (
    document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

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
    tabs.forEach((tab_container) => {
      tab_container.dataset.tabSelected = initial_id.toString();

      let labels = $$('.tabs__label', tab_container);

      labels.forEach((label) => {
        label.onclick = function () {
          let id = this.dataset.tabLabel;
          tab_container.dataset.tabSelected = id;
        };
      });
    });
  }

  initTabs();

  function wrapGrids() {
    const grids = $$('.grid');
    grids.forEach((grid) => {
      wrapGrid(grid, { duration: 1000 });

      const cells = $$('.cell', grid);
      cells.forEach((cell) => {
        let preview_buttons = $$('.ar__preview-button', cell);
        preview_buttons.forEach((button) => {
          button.addEventListener('click', function (e) {
            let ars = $$('.ar');
            let ar_id = this.dataset.ar;
            let parent = button.closest('.ar');
            ars.forEach(el => el.removeAttribute('data-ar-selected'));
            parent.setAttribute('data-ar-selected', ar_id);
          });
        });
      });
    });
  }

  wrapGrids();
});
