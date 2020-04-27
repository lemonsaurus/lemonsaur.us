import random

from django.shortcuts import render
from django.views import View


class Home(View):
    def get(self, request):
        random_brand = random.choice([
            "images/nice_lemon.png",
            "images/lemon_stegosaurus.png"
        ])
        return render(request, "main/home.html", {"brand": random_brand})
