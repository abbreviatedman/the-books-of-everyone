from bs4 import BeautifulSoup
from requests import get
from time import sleep
from json import dump

from data import base_url, characters, episodes
from episode import handle_episode
from error import handle_error

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

