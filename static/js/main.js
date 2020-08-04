function updateComponents() {
    /* Update the components */
    console.log("Updating components...");
    window.hair = window.portrait_components.hair[window.hairIndex];
    window.beard = window.portrait_components.beard[window.beardIndex];
    window.mustache = window.portrait_components.mustache[window.mustacheIndex];
    window.features = window.portrait_components.features[window.featuresIndex];
}

function updatePortrait() {
    /* Update the dynamic portrait */
    console.log("Updating portrait...");
    var backgroundImageString =
      "url('" + window.mustache[1] + "'), url('" +
      window.beard[1] + "'), url('" + window.hair[1] + "'), url('" +
      window.features[1] + "'), url('" +
      "static/images/portrait/baseface.png')";

    // Update the portrait
    window.portrait.style.backgroundImage = backgroundImageString;
}

function updateMenu() {
    /* Update the customization menu */
    console.log("Updating menu...");
    for (var step = 0; step < 4; step++) {
        var option = document.querySelector("#customize-option-" + step);
        option.innerHTML = window[window.component_types[step]][0];
    }
}

function update() {
    updateComponents();
    updatePortrait();
    updateMenu();
}

function changeComponent(type, increment) {
    var components = window.portrait_components[type];
    var currentIndex = window[type + "Index"];
    var newIndex = (currentIndex + increment) % components.length;

    window[type + "Index"] = newIndex;
    update();
}

/* When the page has loaded... */
document.addEventListener("DOMContentLoaded", function() {

    // Set initial components
    window.component_types = Object.keys(window.portrait_components);
    window.hairIndex = 1;
    window.beardIndex = 1;
    window.mustacheIndex = 0;
    window.featuresIndex = 1;

    // Set up globals for the portrait and menu elements
    window.portrait = document.querySelector('div.portrait');
    var menu = document.querySelector('div.menu');
    var doneButton = document.querySelector('img.done-button');

    // Set initial states
    update();

    // Set up event handlers
    window.portrait.addEventListener('click', function() {
        window.portrait.style.marginRight = "-20%";
        window.portrait.classList.add("customizing");
        menu.style.display = "flex";
    });

    doneButton.addEventListener('click', function() {
        window.portrait.style.marginRight = "auto";
        window.portrait.classList.remove("customizing");
        menu.style.display = "none";
    });

    for (var step = 0; step < 4; step++) {
        (function () {
            var left = document.querySelector('#left-arrow-' + step);
            var right = document.querySelector('#right-arrow-' + step);
            var component = window.component_types[step];

            left.addEventListener('click', function(){
                changeComponent(component, -1);
            }, false);
            right.addEventListener('click', function(){
                changeComponent(component, 1);
            }, false);
        }());
    }
});

