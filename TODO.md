# TODO List for Centering Display in Fullscreen

## Completed Tasks
- [x] Add 'fullscreen-mode' class toggle to body when fullscreen changes
- [x] Add CSS styles for centering .display-diegoexito in fullscreen mode
- [x] Set max-width for .display-grid-enhanced to 1200px in fullscreen
- [x] Remove padding from .container-xl in fullscreen
- [x] Add customizable CSS variables for fullscreen centering
- [x] Update fullscreen styles to use CSS variables

## Summary
The display content (#app > div > div > div) is now centered when the screen is enlarged using the fullscreen button. The changes include:
- Toggling a 'fullscreen-mode' class on the body element during fullscreen.
- Applying flexbox centering to the .display-diegoexito container.
- Constraining the grid width to a maximum of 1200px for better readability.
- Added customizable CSS variables in src/assets/styles.css for easy adjustment:
  - --fullscreen-max-width: Maximum width of the grid (default: 1200px)
  - --fullscreen-justify: Horizontal justification (default: center)
  - --fullscreen-align: Vertical alignment (default: center)
  - --fullscreen-padding: Padding around the container (default: 0)

To customize the centering, modify these variables in src/assets/styles.css under the :root selector.
