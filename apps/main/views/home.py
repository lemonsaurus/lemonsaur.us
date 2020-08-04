import json
import logging
import random
import re
from pathlib import Path
from typing import Dict, List, Tuple

from django.conf import settings
from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.views import View

log = logging.getLogger(__name__)


class Home(View):
    def __init__(self, **kwargs) -> None:
        """Initialize this view."""
        super().__init__(**kwargs)
        self.portrait_path = Path(settings.STATIC_ROOT) / "images/portrait"

    @staticmethod
    def _humanize_filename(filename):
        filename = filename.strip()
        filename = re.sub(r"[-_]", " ", filename)
        return filename.title()

    def _get_portrait_components(self) -> Dict[str, List[Tuple[str, str]]]:
        """
        Iterates through all the portrait folders to look for components.

        Returns a dictionary that maps human-readable name to filepath.
        """
        components = {}

        for item in self.portrait_path.iterdir():
            if item.is_dir():
                subcomponents = []
                for file in item.iterdir():
                    subcomponents.append(
                        (self._humanize_filename(file.stem), f"static/images/portrait/{item.stem}/{file.name}")
                    )

                components[item.name] = subcomponents

        return components

    @staticmethod
    def _get_random_brand() -> str:
        """Return an image to use in the top left of the navbar."""
        return random.choice([
            "images/navbar/nice_lemon.png",
            "images/navbar/lemon_stegosaurus.png"
        ])

    def get(self, request):
        """Our main home view."""
        # Iterate through all the chargen components and create a list of parts.
        components = json.dumps(self._get_portrait_components())
        brand = self._get_random_brand()
        return render(request, "main/home.html", {"brand": brand, "components": mark_safe(components)})
