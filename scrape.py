from bs4 import BeautifulSoup
import requests
import sys
from datetime import datetime

characters = {}
episode = {}
episode_url = "https://www.imdb.com/title/tt4917582"
cast_url = "https://www.imdb.com/title/tt4917582/fullcredits"
response = requests.get(episode_url, headers={"User-Agent": "Mozilla/5.0"})
if response.status_code != 200:
    print("An error occurred.")
    print(response.status_code)
    sys.exit(1)

document = BeautifulSoup(response.content, "html.parser")
episode["quotes"] = []
episode["characters"] = []
episode["title"] = document.find("span", {"data-testid": "hero__primary-text"}).get_text()
episode["description"] = document.find("span", {"data-testid": "plot-xl"}).get_text()
episode["code"] = "s01e01"
date = (
    document
        .find("li", {"data-testid": "title-details-releasedate"})
        .find("div")
        .find("a")
        .get_text()
)

episode["airDate"] = datetime.strptime(date.strip(" (United States)"), "%B %d, %Y")
episode["runtime"] = int(
    document
        .find("li", {"data-testid": "title-techspec_runtime"})
        .find("div")
        .get_text()
        .split()[0]
)

response = requests.get(cast_url, headers={"User-Agent": "Mozilla/5.0"})
if response.status_code != 200:
    print("An error occurred.")
    print(response.status_code)
    sys.exit(1)

document = BeautifulSoup(response.content, "html.parser")
cast_listings = document.find("div", {"data-testid": "sub-section-cast"}).find_all("li", {"data-testid": "name-credits-list-item"})
extras_listings = document.find("div", {"data-testid": "second-sub-section-cast"}).find_all("li", {"data-testid": "name-credits-list-item"})

for listing in cast_listings + extras_listings:
    listing_parts = [item.get_text() for item in listing.find_all("a")]
    if len(listing_parts) == 4:
        _, actor, _, name = listing_parts
        if name + "-" + actor in characters:
            characters[name + "-" + actor]["episodes"].append(episode["title"])
        else:
            characters[name + "-" + actor] = {
                "actor": actor,
                "episodes": [episode["title"]],
                "quotes": [],
            }


print(episode)
print(characters)
