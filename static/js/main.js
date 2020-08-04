function updatePortrait(mustache, beard, hair, features) {
    /* Update the dynamic portrait */
    var backgroundImageString =
      "url('" + mustache[1] + "'), url('" +
      beard[1] + "'), url('" + hair[1] + "'), url('" +
      features[1] + "'), url('" +
      "static/images/portrait/baseface.png')";

    // Update the portrait
    window.portrait.style.backgroundImage = backgroundImageString;
}

function updateMenu(mustache, beard, hair, features) {
    /* Update the customization menu */
    document.querySelector("#customize-option-1").innerHTML = mustache[0];
    document.querySelector("#customize-option-2").innerHTML = beard[0];
    document.querySelector("#customize-option-3").innerHTML = hair[0];
    document.querySelector("#customize-option-4").innerHTML = features[0];
}

/* When the page has loaded... */
document.addEventListener("DOMContentLoaded", function() {

    // Set initial components
    window.hair_array = window.portrait_components.hair;
    window.beard_array = window.portrait_components.beard;
    window.mustache_array = window.portrait_components.mustache;
    window.features_array = window.portrait_components.features;

    window.hair = window.hair_array[1];
    window.beard = window.beard_array[1];
    window.mustache = window.mustache_array[0];
    window.features = window.features_array[1];

    // Set up globals for the portrait and menu elements
    window.portrait = document.querySelector('div.portrait');
    window.menu = document.querySelector('div.menu');

    // Set initial states
    updatePortrait(window.mustache, window.beard, window.hair, window.features);
    updateMenu(window.mustache, window.beard, window.hair, window.features);

    // Set up event handlers
    window.portrait.addEventListener('click', function() {
        window.portrait.style.display = "none";
        window.menu.style.display = "flex";
    });
});

