/* globals console: true */

/* Python-style modulo. */
const modulo = (n, m) => ((n % m) + m) % m;

/* Python-style randint. */
const randInt = (n) => Math.floor(Math.random() * n);

/* Click event handler. */
const onClick = (obj, handler) => obj.addEventListener('click', handler);

/* Preloading an image */
function preloadImage(url) {
    (new Image()).src = url;
}

/* Update all the components used for building the portrait. */
function updatePortraitComponents() {
    console.debug('-- Updating portrait components --');
    window.hair = window.portrait_components.hair[window.hairIndex];
    window.beard = window.portrait_components.beard[window.beardIndex];
    window.mustache = window.portrait_components.mustache[window.mustacheIndex];
    window.features = window.portrait_components.features[window.featuresIndex];
    window.hairColor = window.portrait_components.hairColor[window.hairColorIndex];
}

/* Update the portrait itself with new components. */
function updateDynamicPortrait() {
    console.debug('-- Updating portrait --');
    const backgroundImageString = (
        `url('${window.mustache[1]}/${window.hairColor[1]}'),
        url('${window.beard[1]}/${window.hairColor[1]}'),    
        url('${window.hair[1]}/${window.hairColor[1]}'),     
        url('${window.features[1]}')`
    );
    // The portrait comprises multiple images layered
    // on top of each other in the background attribute
    window.portrait.style.backgroundImage = backgroundImageString;
}

/* Update the customization menu with new component data. */
function updateCustomizationMenu() {
    console.debug('-- Updating menu --');
    for (let step = 0; step < 5; step++) {
        console.log(window[window.component_types[step]]);

        let option = document.querySelector('#customize-option-' + step);
        option.innerHTML = window[window.component_types[step]][0];
    }
}

/* Update all the dynamic parts. */
function update() {
    updatePortraitComponents();
    updateDynamicPortrait();
    updateCustomizationMenu();
}

/* Change a component. Used when you click the arrows in the menu. */
function changeComponent(type, increment) {
    const components = window.portrait_components[type];
    const currentIndex = window[type + 'Index'];
    const newIndex = modulo(currentIndex + increment, components.length);

    window[type + 'Index'] = newIndex;
    update();
}

/* Randomize the portrait components */
function randomizePortraitComponents() {
    window.hairIndex = randInt(window.portrait_components.hair.length);
    window.beardIndex = randInt(window.portrait_components.beard.length);
    window.mustacheIndex = randInt(window.portrait_components.mustache.length);
    window.featuresIndex = randInt(window.portrait_components.features.length);
    window.hairColorIndex = randInt(window.portrait_components.hairColor.length);
}

/* Preload all the portrait components */
function preloadPortraitComponents() {
    console.debug("-- Preloading all portrait components --");

    // Preload all components
    window.component_types.forEach((type, _) => {

        // Skip the hairColor type. It has no files of its own, and instead
        // is just a part of the path for mustaches, beards and hairstyles.
        if (type === "hairColor") {
            return;
        }

        const components = window.portrait_components[type];

        // Iterate through all the components...
        components.forEach((component, _) => {

            // And preload the images for each hair color
            for (let i = 0; i < window.portrait_components.hairColor.length; i++) {
                let hairColor = window.portrait_components.hairColor[i];

                // "features" don't have a hairColor.
                if (type !== "features") {
                    preloadImage(`${component[1]}/${hairColor[1]}`);
                } else {
                    preloadImage(`${component[1]}`);
                }
            }
        });
    });
    console.debug("-- Components preload complete --");
}

/* Set up the page with all initial states. */
function setInitialStates(){
    preloadPortraitComponents();
    randomizePortraitComponents();
    update();
}

/* Fetch key view elements. */
const findViewElements = () => ({
    portrait: document.querySelector('div.portrait'),
    menu: document.querySelector('div.menu'),
    doneButton: document.querySelector('img.done-button'),
});

/* Set up event handlers for buttons and panels. */
function setupEventHandlers({portrait, menu, doneButton}){
    const disableCustomizationPanel = () => {
        portrait.classList.remove('customizing');
        portrait.style.marginRight = 'auto';
        menu.style.display = 'none';
    };

    const enableCustomizationPanel = () => {
        portrait.classList.add('customizing');
        portrait.style.marginRight = '-20%';
        menu.style.display = 'flex';
    };

    onClick(portrait, () => {
        const customizationIsActive = portrait.classList.contains('customizing');
        if (customizationIsActive)
            disableCustomizationPanel();
        else
            enableCustomizationPanel();
    });

    onClick(doneButton, disableCustomizationPanel);

    // forEach works like `enumerate` combined with `map` in Python
    window.component_types.forEach( (type, position) => {
        const leftArrow = document.querySelector('#left-arrow-' + position);
        const rightArrow = document.querySelector('#right-arrow-' + position);
        onClick(leftArrow, () => changeComponent(type, -1));
        onClick(rightArrow, () => changeComponent(type, 1));
    });
}

/* Make the page come alive! */
function addInteractivity() {
    const {portrait, menu, doneButton} = findViewElements();
    window.component_types = Object.keys(window.portrait_components);
    window.portrait = portrait;

    setInitialStates();
    setupEventHandlers({portrait, menu, doneButton});
}

/* When the page has loaded... */
document.addEventListener('DOMContentLoaded', addInteractivity);
