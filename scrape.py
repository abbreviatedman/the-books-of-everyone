from bs4 import BeautifulSoup
from bson import ObjectId
from requests import get
from sys import exit
from time import sleep
from json import dump
from datetime import datetime
from re import sub

base_url = "https://www.imdb.com"
characters = {}
episodes = []

def handle_error(url, code):
    print(f"An error occurred accessing {url}.")
    print(code)
    exit(1)

def handle_episode(href, season_num, episode_num):
    response = get(f"{base_url}/{href}", headers={"User-Agent": "Mozilla/5.0"})
    if response.status_code != 200:
        handle_error(response.url, response.status_code)

    document = BeautifulSoup(response.content, "html.parser")
    episode = {
        "_id": {"$oid": str(ObjectId())},
        "quotes": [],
        "characters": [],
        "title": document.find("span", {"data-testid": "hero__primary-text"}).get_text(),
        "description": document.find("span", {"data-testid": "plot-xl"}).get_text(),
        "runtime": int(
            document
                .find("li", {"data-testid": "title-techspec_runtime"})
                .find("div")
                .get_text()
                .split()[0] # Get the first word, which is the number of minutes
        ),
    }

    date = (
        document
            .find("li", {"data-testid": "title-details-releasedate"})
            .find("div")
            .find("a")
            .get_text()
    )

    cleaned_date = sub(r"\s*\(.*\)", "", date) # remove " (United States)" from the end
    episode["airDate"] = {"$date": datetime.strptime(cleaned_date, "%B %d, %Y").isoformat + "Z"}
    season_code = f"s0{season_num}" if season_num < 10 else f"s{season_num}"
    episode_code = f"e0{episode_num}" if episode_num < 10 else f"e{episode_num}"
    episode["code"] = season_code + episode_code

    response = get(f"{base_url}/{href}/fullcredits", headers={"User-Agent": "Mozilla/5.0"})
    if response.status_code != 200:
        handle_error(response.url, response.status_code)

    document = BeautifulSoup(response.content, "html.parser")
    cast_listings = []
    extras_listings = []
    if cast_section :=  document.find("div", {"data-testid": "sub-section-cast"}):
        cast_listings = cast_section.find_all("li", {"data-testid": "name-credits-list-item"})
    if extras_section := document.find("div", {"data-testid": "second-sub-section-cast"}):
        extras_listings = extras_section.find_all("li", {"data-testid": "name-credits-list-item"})

    for listing in cast_listings + extras_listings:
        listing_parts = [item.get_text() for item in listing.find_all("a")]
        if len(listing_parts) >= 4: # Less than this means no character name.
            _, actor, _, *names = listing_parts # every element from index 3 on is a character name
            for name in names:
                episode["characters"].append({"_id": ObjectId(), "name": name})
                # if we can find a character with that name in the character list:
                if character := next((character for character in characters if character["name"] == name), None):
                    character["episodes"].append({"title": episode["title"], "id": episode["_id"]})
                    if actor not in character["actors"]:
                        character["actors"].append(actor)
                else:
                    characters.append({
                        "_id": ObjectId(),
                        "name": name,
                        "actors": [actor],
                        "quotes": [],
                        "episodes": [{"title": episode["title"], "id": episode["_id"]}],
                    })

    episodes.append(episode)

for season_num in range(1, 6):
    print(season_num)
    episode_num = 1
    episode_list_url = f"{base_url}/title/tt4254242/episodes/?season={season_num}"
    response = get(episode_list_url, headers={"User-Agent": "Mozilla/5.0"})
    if not response.ok:
        handle_error(response.url, response.status_code)

    document = BeautifulSoup(response.content, "html.parser")
    # lot of hairy url parsing here, could be room to clean it up
    episode_hrefs = [link.find("a")["href"].split("?")[0][1:].rstrip("/") for link in document.find_all("h4")]
    for href in episode_hrefs:
        print(episode_num)
        handle_episode(href, season_num, episode_num)
        episode_num += 1
        sleep(1)

with open("characters.json", "w") as f:
    dump(characters, f, indent=2, ensure_ascii=False)

with open("episodes.json", "w") as f:
    dump(episodes, f, indent=2, ensure_ascii=False)

