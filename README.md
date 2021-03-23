# Adverse Reactions Demo

## Functional Requirement Specifications (FRS)

The _current_ FRS is:

- These ARs have three levels to "drill down:"
    1. Drug _(Tab)_
    2. Adverse Reactions _(Expansion)_
    3. Grade _(Flip)_
- **Tabs** are a simple show/hide or toggle.
- **ARs** are a card expansion with animation
- **Grades** are a "card flip" type animation.
- Upon AR or Grade drilldown, screen autoscrolls to the top of the card.
- ARs or Grade drilldown always have a "back" button, which either flips back, or collapses the card back.

Currently, there isn't FRS for:

- Whether states should be reset between views. So if I
    
    - Expand Card 1 on Tab 1,
    - Then switch to Tab 2,
    - Then back to Tab 1
    
    This demo currently keeps Card 1 expanded. Additionally, if I
    
    - Expand AR 1 on Card 1,
    - Flip Grade 1,
    - Then expand AR 1 on Card 2 (which auto-collapses Card 1),
    - Then expand AR 1 on Card 1 again
    
    It shows Grade 1 already flipped rather than the AR 1 summary. This is something we'll need to check with the agency if state should be reset between views.
- Wheter we'll need deep linking or not. That is, having some type of [client-side router](https://www.npmjs.com/package/navigo) to reflect our drill down states, so you can link to this page with a certain Tab, AR, or Grade already selected.

## General Programming Concepts

- Given the three layers of drill down (Tabs, Expansion, Flip), we have three chunks of logic to add event listeners for that.
- All of the show/hide (regardless of animation) use CSS attributes with IDs to change the `display`. This is restrictive because it requires us to hard-code in some limit on the IDs. That is, we have code that looks like this:
    
    ```
    @for $i from 1 through $max-ars-buttons-within-a-cell {
      [data-ar-selected='#{$i}'] &:nth-child(#{$i + 1}) {
        display: block;
      }
    }
    ```
    
    So whatever `$max-ars-buttons-within-a-cell` is set to is the maximum number of AR buttons that can live in a card. Currently we have this set to something larger than what the comp shows, so we should be good if the content changes. But it is good to be aware of this limitation regardless.
- Tabs are custom JS.
- Card expansion uses the [animate-css-grid](https://www.npmjs.com/package/animate-css-grid) NPM package.
- Card flip uses custom JS.
- We need to take into account fixed headers and footers, which means our "auto scroll" has some offsets built in.
- Tries to use [FLIP](https://aerotwist.com/blog/flip-your-animations/) animation paradigm.

## Known Bugs

- State not being entirely reset between drill downs (unclear if this is a bug since it isn't spelled out in FRS)
- Resizes are not handled, especially for the card flip since we are setting a fixed height for its animation.
- Does not work on IE, and _cannot_ work in IE due to grid auto layout. Unclear what we are going to do for that browser, I recommend it just doesn't work there.

## Items To Be Fleshed Out In Actual Product

- Making this "automatable," preferrably via some global function. E.g. `window.expandAR({ tab: 1, card: 1, grade: 1})`. When we do automate this, we should disable all transitions, so that toggle should be built into the logic somehow.
- Design
- BEM Classnames
