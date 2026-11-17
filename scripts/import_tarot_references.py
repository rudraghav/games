"""Resume a bounded, source-linked Tarot reference import from Wikimedia.

Discovery uses Wikipedia's editorially curated Vital Articles lists, not random
entities. Each accepted image comes from the resolved identity article's declared
lead image; no face search or actor-for-character substitution is performed.
Metadata and downloads are cached only in the task output directory. Existing
identities, original artwork and the performer-photo archive are never rewritten.
Run from the repository root; image conversion uses the existing Sharp package.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
import time
import unicodedata
from collections import Counter, defaultdict, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import UTC, datetime
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
IDENTITIES = ROOT / "backend/app/games/tarot/characters.json"
ART = ROOT / "apps/web/public/characters/reference-art-v1"
WORK = ROOT / "output/tarot-reference-import-20261117"
UA = "GamesReferenceImporter/1.0 (source-linked catalogue; https://github.com/rudraghav/games)"
API = "https://en.wikipedia.org/w/api.php"
WD = "https://www.wikidata.org/w/api.php"
SOURCES = [
    "Level 4/People",
    "Level 4/Arts",
    "Level 5/Arts/Narrative arts",
    "Level 5/People/Entertainers, directors, producers, and screenwriters",
    "Level 5/People/Sports figures",
    "Level 5/People/Scientists, inventors, and mathematicians",
    "Level 5/People/Writers and journalists",
    "Level 5/People/Philosophers, historians, political and social scientists",
    "Level 5/People/Artists, musicians, and composers",
    "Level 5/People/Politicians and leaders",
    "Level 5/People/Military personnel, revolutionaries, and activists",
    "Level 5/People/Miscellaneous",
]
LANES = {
    "actors": ("actors and film-makers", "Film and television", 1100),
    "science": ("scientists and inventors", "Science and invention", 600),
    "royalty": ("rulers and historical leaders", "Royal and political history", 300),
    "politics": ("political and civic leaders", "Politics and civic life", 550),
    "sport": ("athletes and sport", "Sport", 750),
    "literature": ("writers and thinkers", "Literature and thought", 550),
    "music": ("musicians and performers", "Music", 750),
    "fiction": ("fictional heroes and characters", "Fiction and folklore", 500),
    "visualarts": ("artists and designers", "Art and design", 300),
    "publicfigures": (
        "entrepreneurs and public figures",
        "Public life and enterprise",
        200,
    ),
    "religion": ("religious and mythological figures", "Religious traditions", 120),
}

# Explicit, recognizable additions complement the editorial lists. Each title is
# resolved and rejected if it leads to a list, disambiguation or missing portrait.
FICTION = {
    "Harry Potter": "Harry Potter (character)|Ron Weasley|Severus Snape|Lord Voldemort|Draco Malfoy|Minerva McGonagall|Rubeus Hagrid|Sirius Black|Remus Lupin|Neville Longbottom|Luna Lovegood|Ginny Weasley|Bellatrix Lestrange|Dobby (Harry Potter)|Dolores Umbridge|Alastor Moody|Newt Scamander",
    "The Lord of the Rings": "Samwise Gamgee|Aragorn|Legolas|Gimli (Middle-earth)|Gollum|Bilbo Baggins|Arwen|Galadriel|Sauron|Saruman|Boromir|Éowyn|Faramir|Treebeard|Peregrin Took|Meriadoc Brandybuck",
    "Star Wars": "Luke Skywalker|Leia Organa|Han Solo|Darth Vader|Obi-Wan Kenobi|Yoda|Palpatine|Chewbacca|R2-D2|C-3PO|Padmé Amidala|Rey (Star Wars)|Finn (Star Wars)|Poe Dameron|Kylo Ren|Ahsoka Tano|Darth Maul|Boba Fett|Jango Fett|Qui-Gon Jinn|Mace Windu|Din Djarin|Grogu",
    "DC Comics": "Superman|Batman|Wonder Woman|Aquaman|Green Lantern|The Flash|Catwoman|Joker (character)|Harley Quinn|Lex Luthor|Poison Ivy (character)|Nightwing|Batgirl|Robin (character)|Supergirl|Cyborg (DC Comics)|Raven (DC Comics)|Starfire (Teen Titans)|Beast Boy|Green Arrow|Black Canary|Shazam (DC Comics)|John Constantine|Deathstroke|Darkseid",
    "Marvel Comics": "Spider-Man|Captain America|Thor (Marvel Comics)|Hulk|Black Widow (Natasha Romanova)|Hawkeye (Clint Barton)|Black Panther (character)|Doctor Strange|Scarlet Witch|Vision (Marvel Comics)|Loki (Marvel Comics)|Thanos|Wolverine (character)|Deadpool|Storm (Marvel Comics)|Jean Grey|Cyclops (Marvel Comics)|Professor X|Magneto|Rogue (Marvel Comics)|Gambit (Marvel Comics)|Ms. Marvel (Kamala Khan)|Miles Morales|Captain Marvel (Carol Danvers)|Groot|Rocket Raccoon|Star-Lord|Gamora|Ant-Man (Scott Lang)|Wasp (character)|Daredevil (Marvel Comics character)|Jessica Jones|Luke Cage|Iron Fist (character)",
    "Game of Thrones": "Jon Snow (character)|Arya Stark|Sansa Stark|Daenerys Targaryen|Tyrion Lannister|Cersei Lannister|Jaime Lannister|Ned Stark|Bran Stark|Brienne of Tarth|Samwell Tarly|Sandor Clegane|Petyr Baelish|Varys|Jorah Mormont",
    "Avatar: The Last Airbender": "Aang|Katara (Avatar: The Last Airbender)|Sokka|Zuko|Toph Beifong|Iroh|Azula|Korra",
    "Dragon Ball": "Goku|Vegeta|Gohan|Piccolo (Dragon Ball)|Bulma|Frieza|Krillin|Trunks (Dragon Ball)|Master Roshi",
    "Naruto": "Naruto Uzumaki|Sasuke Uchiha|Sakura Haruno|Kakashi Hatake|Itachi Uchiha|Gaara|Hinata Hyuga|Rock Lee|Jiraiya (Naruto)|Tsunade",
    "One Piece": "Monkey D. Luffy|Roronoa Zoro|Nami (One Piece)|Sanji (One Piece)|Nico Robin|Tony Tony Chopper|Usopp|Portgas D. Ace",
    "Pokémon": "Ash Ketchum|Pikachu|Misty (Pokémon)|Brock (Pokémon)|Charizard|Mewtwo|Jigglypuff|Eevee",
    "SpongeBob SquarePants": "SpongeBob SquarePants (character)|Patrick Star|Squidward Tentacles|Sandy Cheeks|Mr. Krabs|Plankton and Karen",
    "The Simpsons": "Homer Simpson|Marge Simpson|Bart Simpson|Lisa Simpson|Maggie Simpson|Ned Flanders|Mr. Burns|Krusty the Clown",
    "Friends": "Rachel Green|Monica Geller|Chandler Bing|Joey Tribbiani|Ross Geller",
    "The Office": "Dwight Schrute|Jim Halpert|Pam Beesly|Ryan Howard (The Office)|Andy Bernard",
    "Breaking Bad": "Walter White (Breaking Bad)|Jesse Pinkman|Saul Goodman|Gus Fring|Mike Ehrmantraut|Hank Schrader",
    "Sherlock Holmes": "Sherlock Holmes|Dr. Watson|Professor Moriarty|Irene Adler",
    "Stranger Things": "Eleven (Stranger Things)|Jim Hopper (Stranger Things)|Steve Harrington|Dustin Henderson|Joyce Byers|Max Mayfield",
    "Disney animation": "Mickey Mouse|Minnie Mouse|Donald Duck|Goofy|Scrooge McDuck|Snow White (Disney character)|Cinderella (Disney character)|Ariel (The Little Mermaid)|Belle (Beauty and the Beast)|Rapunzel (Tangled)|Tiana (The Princess and the Frog)|Aladdin (Disney character)|Jasmine (Aladdin)|Genie (Disney)|Simba|Scar (The Lion King)|Mufasa|Stitch (Lilo & Stitch)|Maleficent|Ursula (The Little Mermaid)|Cruella de Vil",
    "Toy Story": "Woody (Toy Story)|Buzz Lightyear|Jessie (Toy Story)|Bo Peep (Toy Story)|Rex (Toy Story)",
    "Shrek": "Donkey (Shrek)|Princess Fiona|Puss in Boots (Shrek)",
    "Kung Fu Panda": "Po (Kung Fu Panda)|Master Shifu|Tigress (Kung Fu Panda)",
    "Super Mario": "Mario|Luigi|Bowser|Yoshi|Toad (Nintendo)|Wario|Waluigi|Princess Daisy|Rosalina (Mario)",
    "Sonic the Hedgehog": "Sonic the Hedgehog (character)|Tails (Sonic the Hedgehog)|Knuckles the Echidna|Amy Rose|Shadow the Hedgehog|Doctor Eggman",
    "Video games": "Samus Aran|Kirby (character)|Donkey Kong (character)|Kratos (God of War)|Nathan Drake|Solid Snake|Master Chief (Halo)|Cloud Strife|Tifa Lockhart|Aerith Gainsborough|Sephiroth|Sora (Kingdom Hearts)|Ryu (Street Fighter)|Chun-Li|Liu Kang|Scorpion (Mortal Kombat)|Sub-Zero|Jill Valentine|Leon S. Kennedy|Claire Redfield|Dante (Devil May Cry)|Bayonetta (character)|Arthur Morgan|John Marston|Ezio Auditore da Firenze|Aloy|Ellie (The Last of Us)|Joel Miller",
}

FOCUSED_PEOPLE = {
    "actors": "Shah Rukh Khan|Amitabh Bachchan|Aamir Khan|Salman Khan|Rajinikanth|Kamal Haasan|Mammootty|Mohanlal|Chiranjeevi|Sridevi|Madhuri Dixit|Deepika Padukone|Priyanka Chopra|Alia Bhatt|Tabu (actress)|Vidya Balan|Smita Patil|Irrfan Khan|Naseeruddin Shah|Om Puri|Manoj Bajpayee|Nawazuddin Siddiqui|Rajkummar Rao|Kangana Ranaut|Ranveer Singh|Ranbir Kapoor|Hrithik Roshan|Kareena Kapoor Khan|Kajol|Vijay (actor)|Ajith Kumar|Allu Arjun|Prabhas|Mahesh Babu|N. T. Rama Rao Jr.|Ram Charan|Madhubala|Meena Kumari|Waheeda Rehman|Denzel Washington|Tom Hanks|Meryl Streep|Zhang Ziyi|Gong Li|Chow Yun-fat|Song Kang-ho|Tilda Swinton|Viola Davis|Lupita Nyong'o|Michelle Yeoh|Andy Lau|Jackie Chan|Jet Li|Tony Leung Chiu-wai|Mads Mikkelsen|Omar Sy|Saoirse Ronan|Audrey Hepburn|Katharine Hepburn|Buster Keaton|Morgan Freeman|Leonardo DiCaprio|Natalie Portman|Kate Winslet|Emma Thompson|Judi Dench",
    "science": "C. V. Raman|A. P. J. Abdul Kalam|Srinivasa Ramanujan|Homi J. Bhabha|Satyendra Nath Bose|Meghnad Saha|Jagadish Chandra Bose|Janaki Ammal|Asima Chatterjee|Anna Mani|Vikram Sarabhai|Satish Dhawan|M. S. Swaminathan|Birbal Sahni|S. R. Srinivasa Varadhan|Har Gobind Khorana|Subrahmanyan Chandrasekhar|Venkatraman Ramakrishnan|Prasanta Chandra Mahalanobis|Maryam Mirzakhani|Katherine Johnson|Ada Lovelace|Grace Hopper|Rosalind Franklin|Chien-Shiung Wu|Tu Youyou|Mae Jemison|Kalpana Chawla|Sunita Williams|Marie Curie|Albert Einstein|Isaac Newton|Nikola Tesla|Charles Darwin|Alan Turing|Katalin Karikó|Jennifer Doudna|Emmanuelle Charpentier|Vera Rubin|Lise Meitner|Dorothy Hodgkin|Tim Berners-Lee|Margaret Hamilton (software engineer)|Barbara McClintock|Jane Goodall|Rachel Carson",
    "royalty": "Ashoka|Chandragupta Maurya|Chandragupta II|Harsha|Samudragupta|Akbar|Babur|Humayun|Jahangir|Shah Jahan|Aurangzeb|Shivaji|Sambhaji|Rani of Jhansi|Razia Sultana|Ahilyabai Holkar|Rudrama Devi|Rani Durgavati|Maharana Pratap|Ranjit Singh|Tipu Sultan|Krishnadevaraya|Rajaraja I|Rajendra I|Velu Nachiyar|Nzinga of Ndongo and Matamba|Yaa Asantewaa|Mansa Musa|Hatshepsut|Cleopatra|Nefertiti|Sejong the Great|Wu Zetian|Empress Suiko|Tomyris|Elizabeth I|Catherine the Great|Eleanor of Aquitaine|Victoria, Queen of the United Kingdom|Elizabeth II|Saladin|Suleiman the Magnificent|Cyrus the Great|Alexander the Great|Genghis Khan|Kublai Khan|Napoleon",
    "politics": "Mahatma Gandhi|Jawaharlal Nehru|B. R. Ambedkar|Vallabhbhai Patel|Subhas Chandra Bose|Bhagat Singh|Sarojini Naidu|Indira Gandhi|Atal Bihari Vajpayee|Manmohan Singh|Narendra Modi|Droupadi Murmu|Pratibha Patil|Sushma Swaraj|J. Jayalalithaa|Mayawati|Mamata Banerjee|Aruna Asaf Ali|Savitribai Phule|Jyotirao Phule|Periyar|Kamaladevi Chattopadhyay|Nelson Mandela|Wangari Maathai|Jacinda Ardern|Ellen Johnson Sirleaf|Malala Yousafzai|Winston Churchill|Martin Luther King Jr.|Rosa Parks|Angela Merkel|Luiz Inácio Lula da Silva|Barack Obama|Michelle Obama|Abraham Lincoln|Franklin D. Roosevelt|Eleanor Roosevelt|George Washington|Mikhail Gorbachev|Václav Havel|Lech Wałęsa|Corazon Aquino|Benazir Bhutto|Golda Meir|Harvey Milk|Desmond Tutu|Kofi Annan|Rigoberta Menchú|César Chávez|Dolores Huerta",
    "sport": "Sachin Tendulkar|Virat Kohli|MS Dhoni|Rohit Sharma|Jasprit Bumrah|Kapil Dev|Sunil Gavaskar|Rahul Dravid|Mithali Raj|Smriti Mandhana|Harmanpreet Kaur|Jhulan Goswami|Neeraj Chopra|P. V. Sindhu|Saina Nehwal|Sania Mirza|Mary Kom|Saikhom Mirabai Chanu|Dipa Karmakar|Abhinav Bindra|Viswanathan Anand|R Praggnanandhaa|Gukesh Dommaraju|Koneru Humpy|Harika Dronavalli|Sakshi Malik|Vinesh Phogat|Dutee Chand|Hima Das|P. T. Usha|Milkha Singh|Dhyan Chand|Balbir Singh Sr.|Sunil Chhetri|Bhaichung Bhutia|Leander Paes|Mahesh Bhupathi|Rohan Bopanna|Joshna Chinappa|Lovlina Borgohain|Nikhat Zareen|Manu Bhaker|Avani Lekhara|Sumit Antil|Serena Williams|Venus Williams|Simone Biles|Usain Bolt|Michael Phelps|Lionel Messi|Cristiano Ronaldo|Roger Federer|Rafael Nadal|Novak Djokovic|Tiger Woods|Marta (footballer)|Alex Morgan|Nadia Comăneci|Megan Rapinoe|Naomi Osaka|Hashim Amla|Babar Azam|Brian Lara|Don Bradman|Shane Warne|Wasim Akram|Muttiah Muralitharan|Kumar Sangakkara|Shelly-Ann Fraser-Pryce|Eliud Kipchoge",
    "literature": "Rabindranath Tagore|Premchand|R. K. Narayan|Ruskin Bond|Arundhati Roy|Kiran Desai|Anita Desai|Jhumpa Lahiri|Ismat Chughtai|Amrita Pritam|Mahasweta Devi|Saadat Hasan Manto|Faiz Ahmed Faiz|Ghalib|Kalidasa|Kabir|Mirabai|Tulsidas|Avvaiyar|Andal|Thiruvalluvar|Subramania Bharati|U. R. Ananthamurthy|Vijay Tendulkar|Girish Karnad|Qurratulain Hyder|Bama (writer)|K. R. Meera|Geetanjali Shree|Perumal Murugan|Wole Soyinka|Chinua Achebe|Toni Morrison|Maya Angelou|Ursula K. Le Guin|Octavia E. Butler|Chimamanda Ngozi Adichie|Haruki Murakami|Gabriel García Márquez|Carlos Ruiz Zafón|Margaret Atwood|Jane Austen|Virginia Woolf|Mary Shelley|Agatha Christie|J. R. R. Tolkien|George Orwell|Albert Camus|James Baldwin|Isabel Allende|Naguib Mahfouz|Orhan Pamuk",
    "music": "Lata Mangeshkar|Asha Bhosle|Kishore Kumar|Mohammed Rafi|Mukesh|Manna Dey|Hemant Kumar|S. P. Balasubrahmanyam|K. J. Yesudas|P. B. Sreenivas|P. Susheela|S. Janaki|K. S. Chithra|Shreya Ghoshal|Sunidhi Chauhan|Arijit Singh|Shankar Mahadevan|Sonu Nigam|Udit Narayan|Alka Yagnik|Kavita Krishnamurti|A. R. Rahman|Ilaiyaraaja|M. S. Subbulakshmi|Bhimsen Joshi|Bismillah Khan|Ravi Shankar|Zakir Hussain (musician)|Shivkumar Sharma|Hariprasad Chaurasia|Amjad Ali Khan|Kumar Gandharva|Kishori Amonkar|Begum Akhtar|Parveen Sultana|Daler Mehndi|Diljit Dosanjh|Beyoncé|Taylor Swift|Rihanna|Shakira|Celine Dion|Freddie Mercury|David Bowie|Prince (musician)|Stevie Wonder|Aretha Franklin|Nina Simone|Miriam Makeba|Youssou N'Dour|Fela Kuti|Angélique Kidjo|Nusrat Fateh Ali Khan|Rahat Fateh Ali Khan|Abida Parveen|Mehdi Hassan|Ghulam Ali|Atif Aslam|Adele|Whitney Houston|Dolly Parton|Johnny Cash|Bob Marley|Bob Dylan|Joni Mitchell|Tracy Chapman|Faye Wong|Teresa Teng",
}


SOURCE_NAMES = {
    "Earth-616": "Marvel Comics",
    "DC Universe": "DC Comics",
    "Star Wars Legends": "Star Wars",
    "Star Wars universe": "Star Wars",
    "Gilliverse": "Breaking Bad / Better Call Saul",
}
REFERENCE_LABELS = {
    "actors": "Reference from film and performance.",
    "science": "Reference from science and invention.",
    "royalty": "Reference from royal and political history.",
    "politics": "Reference from politics and civic life.",
    "sport": "Reference from sport.",
    "literature": "Reference from literature and thought.",
    "music": "Reference from music.",
    "visualarts": "Reference from art and design.",
    "publicfigures": "Reference from public life and enterprise.",
    "religion": "Reference from religious traditions.",
}


def reference_description(category, source):
    return (
        ("Character from " + source + ".")
        if category == "fiction"
        else REFERENCE_LABELS[category]
    )


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def plain(value):
    parser = TextOnly()
    parser.feed(str(value or ""))
    return re.sub(r"\s+", " ", unescape(" ".join(parser.parts))).strip()


def normalize(value):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", value).lower())


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)


def get_json(base, params, cache):
    if cache.exists():
        return json.loads(cache.read_text())
    url = base + "?" + urlencode(params)
    error = None
    for attempt in range(3):
        try:
            with urlopen(
                Request(url, headers={"User-Agent": UA}), timeout=35
            ) as response:
                data = response.read(16_000_001)
                if len(data) > 16_000_000:
                    raise ValueError("Metadata response exceeds 16 MB cap")
                result = json.loads(data)
                if "error" in result:
                    raise ValueError(result["error"].get("info", "MediaWiki error"))
                dump(cache, result)
                return result
        except (OSError, ValueError, TimeoutError) as exc:
            error = exc
            if attempt < 2:
                time.sleep(1 + 2 * attempt)
    raise RuntimeError(f"Metadata request failed: {type(error).__name__}: {error}")


def category_for(source, sections):
    text = " / ".join(sections).lower()
    if source.endswith("/Scientists, inventors, and mathematicians"):
        return "science"
    if source.endswith(
        (
            "/Writers and journalists",
            "/Philosophers, historians, political and social scientists",
        )
    ):
        return "literature"
    if source.endswith("/Artists, musicians, and composers"):
        return "visualarts" if "visual artists" in text else "music"
    if source.endswith("/Politicians and leaders"):
        return (
            "royalty"
            if any(era in text for era in ["ancient", "medieval", "early modern"])
            else "politics"
        )
    if source.endswith("/Military personnel, revolutionaries, and activists"):
        return "politics"
    if source.endswith("/Miscellaneous"):
        # Curate public work, rather than importing notoriety, crime victims or
        # pseudoscience merely because an article appears in the mixed list.
        allowed = (
            "businesspeople",
            "explorers",
            "chefs, bartenders and winemakers",
            "tradespeople",
        )
        return (
            "publicfigures"
            if sections and sections[0].lower().strip() in allowed
            else None
        )
    if source.endswith("/Arts") or "/Arts/" in source:
        return "fiction" if "fictional and legendary characters" in text else None
    if source.endswith("/Sports figures"):
        return "sport"
    if "Entertainers, directors" in source:
        return "actors"
    heading = sections[0].lower() if sections else ""
    if heading in ("entertainers", "directors, producers and screenwriters"):
        return "actors"
    if heading == "musicians and composers":
        return "music"
    if heading in (
        "writers",
        "philosophers, historians, political and social scientists",
    ):
        return "literature"
    if heading == "scientists, inventors and mathematicians":
        return "science"
    if heading == "sports figures":
        return "sport"
    if heading == "rebels, revolutionaries and activists":
        return "politics"
    if heading == "politicians and leaders":
        return (
            "politics"
            if len(sections) > 1 and sections[1].lower() == "modern"
            else "royalty"
        )
    return None


def discover():
    candidates, seen = [], set()
    for source in SOURCES:
        path = WORK / (source.replace("/", "-").replace(" ", "-") + ".json")
        data = get_json(
            API,
            {
                "action": "parse",
                "page": "Wikipedia:Vital articles/" + source,
                "prop": "wikitext",
                "format": "json",
                "redirects": 1,
            },
            path,
        )
        sections = {}
        for line in data["parse"]["wikitext"]["*"].splitlines():
            heading = re.match(r"^(={2,6})\s*(.*?)\s*\1\s*$", line)
            if heading:
                level = len(heading[1])
                sections = {k: v for k, v in sections.items() if k < level}
                sections[level] = plain(re.sub(r"\{\{.*?\}\}", "", heading[2])).strip()
                continue
            if not re.match(r"^#+\s", line):
                continue
            category = category_for(source, list(sections.values()))
            if not category:
                continue
            match = re.search(r"\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]", line)
            if not match:
                continue
            title = match[1]
            if ":" in title or title in seen:
                continue
            seen.add(title)
            candidates.append(
                {
                    "title": title,
                    "category": category,
                    "kind": "character" if category == "fiction" else "person",
                    "section": " / ".join(sections.values()),
                    "seedPage": "https://en.wikipedia.org/wiki/"
                    + quote("Wikipedia:Vital articles/" + source),
                    "priority": 0 if source.startswith("Level 4") else 2,
                }
            )
    for franchise, titles in FICTION.items():
        for title in titles.split("|"):
            if title in seen:
                continue
            seen.add(title)
            candidates.append(
                {
                    "title": title,
                    "category": "fiction",
                    "kind": "character",
                    "source": franchise,
                    "section": franchise,
                    "priority": 1,
                    "seedPage": "https://en.wikipedia.org/wiki/" + quote(title),
                }
            )
    # A title already present in a Vital list is promoted in place, not duplicated.
    for category, titles in FOCUSED_PEOPLE.items():
        for title in titles.split("|"):
            existing = next((c for c in candidates if c["title"] == title), None)
            if existing:
                existing["priority"] = -1
            else:
                candidates.append(
                    {
                        "title": title,
                        "category": category,
                        "kind": "person",
                        "section": "Focused cross-region selection",
                        "priority": -1,
                        "seedPage": "https://en.wikipedia.org/wiki/" + quote(title),
                    }
                )
    extra_path = ROOT / "scripts/tarot_reference_seeds.json"
    extras = json.loads(extra_path.read_text()) if extra_path.exists() else []
    for candidate in extras:
        existing = next(
            (c for c in candidates if c["title"] == candidate["title"]), None
        )
        if existing:
            existing.update(candidate)
        else:
            candidates.append(candidate)
    # Round robin sections within each priority avoids selecting only the first
    # geographical region, sport, era or gender represented by a long source list.
    ordered = []
    for category in LANES:
        for priority in [-1, 0, 1, 2]:
            buckets = defaultdict(deque)
            for candidate in candidates:
                if (
                    candidate["category"] == category
                    and candidate["priority"] == priority
                ):
                    buckets[candidate["section"]].append(candidate)
            while any(buckets.values()):
                for queue in buckets.values():
                    if queue:
                        ordered.append(queue.popleft())
    dump(WORK / "candidates.json", ordered)
    print(
        "Discovered",
        len(ordered),
        dict(Counter(c["category"] for c in ordered)),
        flush=True,
    )
    return ordered


def page_batch(candidates):
    titles = "|".join(c["title"] for c in candidates)
    data = get_json(
        API,
        {
            "action": "query",
            "titles": titles,
            "redirects": 1,
            "format": "json",
            "prop": "pageimages|pageprops|info",
            "piprop": "name|original",
            "pilicense": "any",
            "inprop": "url",
        },
        WORK / "pages" / (sha256(titles.encode()).hexdigest()[:20] + ".json"),
    )
    query = data["query"]
    redirects = {
        r["from"]: r["to"]
        for r in query.get("normalized", []) + query.get("redirects", [])
    }
    pages = {p["title"]: p for p in query["pages"].values()}
    result = []
    for candidate in candidates:
        title = candidate["title"]
        for _ in range(5):
            title = redirects.get(title, title)
        page = pages.get(title, {})
        props = page.get("pageprops", {})
        if not props.get("wikibase_item") or "disambiguation" in props:
            continue
        if title.startswith(
            ("List of ", "Lists of ", "Characters of ", "Category:", "Template:")
        ):
            continue
        result.append(
            {
                **candidate,
                "articleTitle": title,
                "wikidataId": props["wikibase_item"],
                "sourcePage": page["fullurl"],
                "file": page.get("pageimage"),
            }
        )
    return result


def enrich(rows):
    enriched = []
    for offset in range(0, len(rows), 50):
        batch = rows[offset : offset + 50]
        ids = "|".join(dict.fromkeys(r["wikidataId"] for r in batch))
        data = get_json(
            WD,
            {
                "action": "wbgetentities",
                "ids": ids,
                "props": "labels|descriptions",
                "languages": "en",
                "format": "json",
            },
            WORK / "entities" / (sha256(ids.encode()).hexdigest()[:20] + ".json"),
        )
        # A bounded VALUES query is fast and excludes bands/organisations from
        # the person type. It also supplies an exact fictional universe when set.
        query = (
            "SELECT ?item ?type ?contextLabel ?sitelinks WHERE { VALUES ?item { "
            + " ".join("wd:" + value for value in ids.split("|"))
            + " } OPTIONAL { ?item wikibase:sitelinks ?sitelinks. } OPTIONAL { ?item wdt:P31 ?type. } OPTIONAL { ?item wdt:P1080 ?context. "
            '?context rdfs:label ?contextLabel. FILTER(LANG(?contextLabel)="en") } }'
        )
        relations = get_json(
            "https://query.wikidata.org/sparql",
            {"format": "json", "query": query},
            WORK / "relations-v2" / (sha256(ids.encode()).hexdigest()[:20] + ".json"),
        )
        types, contexts, sitelinks = defaultdict(set), defaultdict(list), {}
        for binding in relations["results"]["bindings"]:
            entity = binding["item"]["value"].rsplit("/", 1)[-1]
            if "sitelinks" in binding:
                sitelinks[entity] = int(binding["sitelinks"]["value"])
            if "type" in binding:
                types[entity].add(binding["type"]["value"].rsplit("/", 1)[-1])
            if "contextLabel" in binding:
                contexts[entity].append(binding["contextLabel"]["value"])
        for row in batch:
            item = data["entities"].get(row["wikidataId"], {})
            label = (
                item.get("labels", {}).get("en", {}).get("value") or row["articleTitle"]
            )
            name = row["articleTitle"] if row["kind"] == "person" else label
            description = item.get("descriptions", {}).get("en", {}).get("value", "")
            if not name or not description or len(name) > 70:
                continue
            if (
                row["priority"] == 2
                and row["kind"] == "person"
                and sitelinks.get(row["wikidataId"], 0) < 12
            ):
                continue
            if row["kind"] == "person" and "Q5" not in types[row["wikidataId"]]:
                continue
            if (
                row["kind"] == "character"
                and contexts[row["wikidataId"]]
                and row.get("source")
                not in set(FICTION) - {"Disney animation", "Video games"}
            ):
                context = min(contexts[row["wikidataId"]])
                if len(context) <= 100:
                    row = {**row, "source": context}
            if any(
                term in description.lower()
                for term in [
                    "disambiguation",
                    "list of ",
                    "musical group",
                    "rock band",
                    "pop band",
                ]
            ):
                continue
            if row["kind"] == "person" and any(
                term in description.lower()
                for term in ["fictional", "character", "legendary", "mythological"]
            ):
                continue
            if row["kind"] == "character" and not any(
                term in description.lower()
                for term in [
                    "character",
                    "fictional",
                    "superhero",
                    "supervillain",
                    "folklore",
                    "fairy tale",
                    "legendary",
                    "mytholog",
                    "comic strip",
                ]
            ):
                continue
            if len(description) > 120:
                description = description[:117].rsplit(" ", 1)[0] + "…"
            enriched.append(
                {
                    **row,
                    "name": name,
                    "slugName": label,
                    "description": description,
                    "sitelinks": sitelinks.get(row["wikidataId"], 0),
                    "recognizability": row.get(
                        "recognizability",
                        "regional"
                        if "Indian cinema" in row.get("section", "")
                        else "major"
                        if row["priority"] <= 1
                        else "supporting",
                    ),
                }
            )
    return enriched


def _paragraph_excerpt(text):
    """Score adjacent complete sentences within one source paragraph."""
    text = re.sub(r"\s+", " ", plain(text)).strip()
    protected = re.sub(r"\b([A-Z])\.", r"\1∯", text)
    protected = re.sub(
        r"\b(Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|c|ca|fl|r|b|d)\.", r"\1∯", protected
    )
    # Dates, pronunciations and translated titles often contain punctuation.
    # A full stop inside a parenthetical is not the end of the outer sentence.
    boundaries = []
    opening = []
    parentheticals = []
    quotation_spans = []
    straight_quote = None
    curly_quotes = []
    for index, character in enumerate(protected):
        if character == "(":
            opening.append(index)
        elif character == ")" and opening:
            parentheticals.append((opening.pop(), index))
        if character == '"':
            if straight_quote is None:
                straight_quote = index
            else:
                quotation_spans.append((straight_quote, index))
                straight_quote = None
        elif character == "“":
            curly_quotes.append(index)
        elif character == "”" and curly_quotes:
            quotation_spans.append((curly_quotes.pop(), index))
    for match in re.finditer(r'[.!?]["”]?(?=\s+[A-Z0-9“]|$)', protected):
        # The public extract can contain an unmatched pronunciation parenthesis.
        # Only a closed span may swallow sentence boundaries that follow it.
        if not any(left < match.start() < right for left, right in parentheticals) and not any(
            left < match.start() and match.end() <= right
            for left, right in quotation_spans
        ):
            boundaries.append(match.end())
    sentences, start = [], 0
    for end in boundaries:
        sentence = protected[start:end].replace("∯", ".").strip()
        if sentence:
            # An extract can end in the middle of a quotation. Keep an empty
            # slot so eligible windows never join non-adjacent source sentences.
            balanced = sentence.count('"') % 2 == 0 and sentence.count("“") == sentence.count("”")
            # A public extract can carry a warning on an unsupported claim.
            # Omit that whole sentence, never just remove the warning and
            # present the remaining claim as established source context.
            warning = re.search(
                r"\[(?:citation needed|clarification needed|dubious[^\]]*|"
                r"verification needed|failed verification|better source needed|"
                r"unreliable source[^\]]*|original research[^\]]*)\]",
                sentence,
                re.IGNORECASE,
            )
            if warning and not sentence[:warning.start()].strip() and sentences:
                sentences[-1] = ""
            sentences.append(sentence if balanced and not warning else "")
        start = end
    concrete = {
        "known",
        "pioneered",
        "developed",
        "discovered",
        "created",
        "invented",
        "founded",
        "designed",
        "wrote",
        "composed",
        "directed",
        "explores",
        "struggles",
        "symbolizes",
        "represents",
        "seeks",
        "quest",
        "journey",
        "protects",
        "dance",
        "destroyer",
        "preserver",
        "union",
        "resistance",
        "transformed",
        "revolutionized",
        "championed",
        "established",
        "researched",
        "proved",
        "built",
        "revolution",
        "liberation",
        "justice",
        "education",
        "theory",
        "invention",
        "conflict",
        "trained",
        "seduced",
        "aspires",
        "seizes",
        "rejects",
        "helps",
        "saves",
        "revive",
        "defeat",
        "transforms",
        "fights",
        "overcomes",
        "contributions",
        "appointed",
        "earned",
        "joins",
        "leaves",
        "supports",
        "pranks",
        "learns",
        "chooses",
        "refuses",
        "breakthrough",
        "reform",
        "innovation",
        "research",
    }
    credits = (
        "portrayed by",
        "voiced by",
        "premiered",
        "broadcast",
        "guest appearance",
        "box office",
        "award",
        "grammy",
        "academy award",
        "appears in",
        "appeared in",
        "film of",
        "performance",
        "introduced in",
    )

    def score(item):
        index, sentence = item
        tokens = set(re.findall(r"[a-z]+", sentence.lower()))
        return (
            len(tokens & concrete) * 3
            + (2 if index == 0 else 0)
            - sum(3 for phrase in credits if phrase in sentence.lower())
        )

    windows = []
    for start in range(len(sentences)):
        for count in (2, 3):
            selected = sentences[start : start + count]
            if len(selected) != count or not all(selected):
                continue
            excerpt = " ".join(selected)
            if len(excerpt) <= 600 and len(excerpt.split()) <= 100:
                value = sum(
                    score((index, sentences[index]))
                    for index in range(start, start + count)
                )
                windows.append((value, -start, -len(excerpt), excerpt))
    if windows:
        return max(windows)
    # An unusually long lead may only fit one complete sentence. Do not clip
    # clauses or join non-adjacent sentences whose pronouns lose their antecedent.
    single = [
        (score((index, sentence)), -index, -len(sentence), sentence)
        for index, sentence in enumerate(sentences)
        if sentence and len(sentence) <= 600 and len(sentence.split()) <= 100
    ]
    return max(single) if single else (0, 0, 0, "")


def informative_excerpt(text):
    """Retain a concrete source paragraph, never a namesake or detached opinion.

    Biography leads can include quotations and an unrelated real-world namesake.
    Keeping paragraph boundaries prevents an attribution being separated from a
    quote or the fictional subject being replaced by that namesake's biography.
    """
    candidates = []
    for index, paragraph in enumerate(re.split(r"\n+", text)):
        if re.search(
            r"\b(?:real-life|namesake|named after a friend)\b|"
            r"\bI (?:am|have|was|had|reflect|believe|think|admire|consider|feel|see)\b|"
            r"\b[Ff]or me\b",
            paragraph,
        ):
            continue
        score, start, length, excerpt = _paragraph_excerpt(paragraph)
        if excerpt:
            candidates.append((score, -index, start, length, excerpt))
    return max(candidates)[-1] if candidates else ""


def source_contexts(rows):
    result = []
    for offset in range(0, len(rows), 20):
        batch = rows[offset : offset + 20]
        titles = "|".join(r["articleTitle"] for r in batch)
        data = get_json(
            API,
            {
                "action": "query",
                "titles": titles,
                "redirects": 1,
                "format": "json",
                "prop": "extracts|info|pageprops",
                "exintro": 1,
                "explaintext": 1,
                "exlimit": 20,
                "inprop": "url",
            },
            WORK / "contexts-v2" / (sha256(titles.encode()).hexdigest()[:20] + ".json"),
        )
        pages = {
            p.get("pageprops", {}).get("wikibase_item"): p
            for p in data["query"]["pages"].values()
        }
        for row in batch:
            page = pages.get(row["wikidataId"], {})
            context = informative_excerpt(page.get("extract", ""))
            if len(context) < 40:
                continue
            result.append(
                {
                    **row,
                    "sourceContext": context,
                    "contextSourceUrl": page.get("fullurl", row["sourcePage"])
                    + "?oldid="
                    + str(page["lastrevid"]),
                    "contextRetrievedAt": datetime.now(UTC).date().isoformat(),
                    "contextLicense": "CC BY-SA 4.0",
                    "contextAttribution": "Wikipedia contributors; linked article revision",
                    "contextModifications": "Selected adjacent complete informative lead sentences; no rewritten clauses; at most100words/600characters.",
                }
            )
    return result


def image_batch(rows):
    titles = "|".join("File:" + r["file"] for r in rows)
    data = get_json(
        API,
        {
            "action": "query",
            "titles": titles,
            "format": "json",
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata",
            "iiurlwidth": 400,
            "iiurlheight": 500,
            "iiextmetadatalanguage": "en",
        },
        WORK / "imageinfo" / (sha256(titles.encode()).hexdigest()[:20] + ".json"),
    )
    images = {
        p["title"].removeprefix("File:").replace("_", " "): p.get("imageinfo", [])
        for p in data["query"]["pages"].values()
    }
    return [(row, images.get(row["file"].replace("_", " "), [])) for row in rows]


SHARP = """import sharp from 'sharp';
let source=sharp(process.argv[1],{limitInputPixels:40000000}).rotate();
const crop=JSON.parse(process.argv[3] || 'null');
if(crop) source=source.extract(crop);
await source.resize(320,400,{fit:'contain',background:'#f7f1e3',withoutEnlargement:false})
 .flatten({background:'#f7f1e3'}).webp({quality:78,effort:5}).toFile(process.argv[2]);"""


def acquire(pair):
    row, infos = pair
    if not infos:
        return None, "missing file metadata"
    info = infos[0]
    review_path = ART / "review.json"
    review = json.loads(review_path.read_text()) if review_path.exists() else {}
    framing = next(
        (r for r in review.get("framing", []) if r["entityId"] == row["wikidataId"]),
        None,
    )
    image_url = info.get("thumburl", info.get("url", "")).replace(
        "http://", "https://", 1
    )
    if framing:
        image_url = framing["remoteImage"]
    media_hosts = {"upload.wikimedia.org", "thumb.wikimedia.org"}
    if urlparse(image_url).hostname not in media_hosts:
        return None, "non-Wikimedia image host"
    width, height = info.get("width", 0), info.get("height", 0)
    if not width or not height or width / height > 1.7 or width / height < 0.28:
        return None, "unsuitable source aspect"
    metadata = {
        k: plain(v.get("value", "")) for k, v in info.get("extmetadata", {}).items()
    }
    credit = " · ".join(
        dict.fromkeys(v for v in [metadata.get("Artist"), metadata.get("Credit")] if v)
    )
    if not credit:
        return None, "missing source credit"
    license_name = metadata.get("LicenseShortName") or metadata.get("UsageTerms", "")
    license_url = metadata.get("LicenseUrl", "")
    if license_url.startswith("//"):
        license_url = "https:" + license_url
    if license_url.startswith("http://"):
        license_url = "https://" + license_url[7:]
    # A photograph can be openly licensed while its depicted artwork is not.
    # Wikimedia's non-free declaration applies to the complete image and takes
    # precedence over the photographer's LicenseShortName/LicenseUrl fields.
    non_free = metadata.get("NonFree", "").lower() == "true" or any(
        marker in metadata.get("Categories", "").lower()
        for marker in ("all non-free media", "freely licensed images of non-free subjects")
    )
    if non_free:
        rights = {
            "rights": "copyright-reference",
            "rightsNote": "The linked source declares non-free content, including any separately copyrighted depicted work. A photographer's open licence does not license the complete image; no open reuse licence is asserted.",
        }
    elif (
        "public domain" in license_name.lower()
        or metadata.get("Copyrighted") == "False"
    ):
        rights = {
            "rights": "public-domain",
            "rightsNote": license_name
            or "The source file metadata marks this image as public domain.",
        }
    elif license_name and license_url.startswith("https://"):
        rights = {
            "rights": "licensed",
            "license": license_name,
            "licenseUrl": license_url,
        }
    else:
        rights = {
            "rights": "copyright-reference",
            "rightsNote": "Copyright remains with the original image/work rights holder. Exact identity-linked reference for commentary; no open reuse license is asserted.",
        }
    slug = re.sub(
        r"[^a-z0-9]+",
        "-",
        unicodedata.normalize("NFKD", row.get("slugName", row["name"]))
        .encode("ascii", "ignore")
        .decode()
        .lower(),
    ).strip("-")
    ident = (slug or "reference") + "-" + row["wikidataId"].lower()
    name_review = next(
        (
            r
            for r in review.get("nameCorrections", [])
            if r["entityId"] == row["wikidataId"]
        ),
        None,
    )
    if name_review:
        ident = name_review["id"]
    target = ART / (ident + ".webp")
    if not target.exists():
        with urlopen(
            Request(image_url, headers={"User-Agent": UA}), timeout=35
        ) as response:
            if urlparse(response.url).hostname not in media_hosts:
                raise ValueError("Unexpected image redirect")
            blob = response.read(3_000_001)
        if len(blob) > 3_000_000:
            return None, "source exceeds 3 MB cap"
        with tempfile.TemporaryDirectory(prefix="reference-", dir=WORK) as directory:
            source, converted = (
                Path(directory) / "source",
                Path(directory) / "converted.webp",
            )
            source.write_bytes(blob)
            subprocess.run(
                [
                    "node",
                    "--input-type=module",
                    "-e",
                    SHARP,
                    str(source),
                    str(converted),
                    json.dumps(framing["crop"] if framing else None),
                ],
                cwd=ROOT,
                check=True,
                capture_output=True,
                timeout=30,
            )
            converted.replace(target)
    blob = target.read_bytes()
    lane, source_context, _ = LANES[row["category"]]
    source_context = SOURCE_NAMES.get(
        row.get("source", source_context), row.get("source", source_context)
    )
    source_review = next(
        (
            r
            for r in review.get("sourceCorrections", [])
            if r["entityId"] == row["wikidataId"]
        ),
        None,
    )
    if source_review:
        source_context = source_review["after"]
    former_name = row.get("slugName", row["name"])
    aliases = (
        [former_name]
        if normalize(former_name) != normalize(row["name"])
        and former_name != "Isadora Duncana"
        else []
    )
    source_aliases = [source_review["before"]] if source_review else []
    identity = {
        "id": ident,
        "name": row["name"],
        "source": source_context,
        "lane": lane,
        "aliases": aliases,
        "sourceAliases": source_aliases,
        "kind": row["kind"],
        "category": row["category"],
        "wikidataId": row["wikidataId"],
        "wikipediaUrl": row["sourcePage"],
        "description": reference_description(row["category"], source_context),
    }
    for key in (
        "tradition",
        "identityFamily",
        "sourceContext",
        "contextSourceUrl",
        "contextRetrievedAt",
        "contextLicense",
        "contextAttribution",
        "contextModifications",
        "sitelinks",
        "recognizability",
    ):
        if key in row:
            identity[key] = row[key]
    asset = {
        "id": ident,
        "imageType": row["kind"],
        "origin": "sourced",
        "reviewStatus": "pending",
        "artworkVersion": "reference-art-v1",
        "image": "/characters/reference-art-v1/" + target.name,
        "alt": row["name"] + " — " + identity["source"],
        "credit": credit,
        "sourcePage": row["sourcePage"],
        "filePage": info["descriptionurl"].replace("http://", "https://", 1),
        "remoteImage": image_url,
        "entityId": row["wikidataId"],
        **rights,
        "width": 320,
        "height": 400,
        "bytes": len(blob),
        "sha256": sha256(blob).hexdigest(),
        "modifications": "Fitted without cropping into a 4:5 ivory frame, resized to 320×400 and converted to WebP.",
        "sourceSelection": "Declared lead image on the resolved canonical Wikipedia identity article.",
        "discoverySource": row["seedPage"],
    }
    if framing:
        asset["sourceCrop"] = framing["crop"]
        asset["sourceDimensions"] = framing["sourceDimensions"]
        asset["modifications"] = (
            "Manually framed the identified subject from the original image; resized to 320×400 and converted to WebP. No generative alteration."
        )
    return (identity, asset), None


def queue_repairs(rows, reason):
    path = ART / "repair-queue.json"
    queue = json.loads(path.read_text()) if path.exists() else []
    seen = {
        (r.get("entityId", r.get("wikidataId")), r.get("file", r.get("filePage")))
        for r in queue
    }
    for row in rows:
        key = (row.get("wikidataId"), row.get("file"))
        if key not in seen:
            queue.append({**row, "state": "needs_source_repair", "reason": reason})
            seen.add(key)
    dump(path, queue)


def main():
    global ART, IDENTITIES
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--discover-only", action="store_true")
    parser.add_argument(
        "--stage",
        action="store_true",
        help="Write drafts to ignored staging; preserve the accepted active catalogue.",
    )
    parser.add_argument(
        "--contexts-only",
        action="store_true",
        help="Enrich existing canonical Wikipedia identities without image acquisition.",
    )
    parser.add_argument("--workers", type=int, default=3, choices=range(1, 5))
    parser.add_argument("--category", choices=list(LANES))
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Bound accepted new references for a trial run.",
    )
    args = parser.parse_args()
    WORK.mkdir(parents=True, exist_ok=True)
    if args.stage:
        stage = WORK / "staging-5000"
        stage.mkdir(exist_ok=True)
        staged_art = stage / "art"
        staged_art.mkdir(exist_ok=True)
        for name in ("manifest.json", "review.json"):
            if not (staged_art / name).exists():
                dump(staged_art / name, json.loads((ART / name).read_text()))
        staged_identities = stage / "characters.json"
        if not staged_identities.exists():
            dump(staged_identities, json.loads(IDENTITIES.read_text()))
        ART, IDENTITIES = staged_art, staged_identities
    ART.mkdir(parents=True, exist_ok=True)
    if args.contexts_only:
        original = json.loads(IDENTITIES.read_text())
        eligible = [
            {
                **r,
                "sourcePage": r["wikipediaUrl"],
                "articleTitle": unquote(r["wikipediaUrl"].split("/wiki/")[-1]).replace(
                    "_", " "
                ),
            }
            for r in original
            if r.get("wikidataId")
            and r.get("contextModifications")
            != "Selected adjacent complete informative lead sentences; no rewritten clauses; at most100words/600characters."
        ]
        by_id = {r["id"]: r for r in original}
        for offset in range(0, len(eligible), 20):
            for row in source_contexts(eligible[offset : offset + 20]):
                by_id[row["id"]].update(
                    {
                        key: value
                        for key, value in row.items()
                        if key.startswith("context") or key == "sourceContext"
                    }
                )
            dump(IDENTITIES, original)
            print(
                "Enriched contexts",
                min(offset + 20, len(eligible)),
                "of",
                len(eligible),
                flush=True,
            )
        return
    candidates = discover()
    if args.discover_only:
        return
    original = json.loads(IDENTITIES.read_text())
    new_assets = (
        json.loads((ART / "manifest.json").read_text())
        if (ART / "manifest.json").exists()
        else []
    )
    new_ids = {a["id"] for a in new_assets}
    old = [r for r in original if r["id"] not in new_ids]
    accepted = [r for r in original if r["id"] in new_ids]
    names = {
        normalize(n) for row in original for n in [row["name"], *row.get("aliases", [])]
    }
    review = (
        json.loads((ART / "review.json").read_text())
        if (ART / "review.json").exists()
        else {}
    )
    # An unsuitable photograph is not an exclusion of the named reference.
    # Preserve prior decisions as a repair queue, while allowing an exact new
    # depiction to be acquired and reviewed. Editorial holds remain separate.
    entity_ids = {r.get("wikidataId") for r in original}
    queue_repairs(
        [
            {**row, "wikidataId": row["entityId"], "priorImageExclusion": True}
            for row in review.get("excluded", [])
            if row["entityId"] not in entity_ids
        ],
        "Prior image excluded; retain the canonical name for exact-source repair or individual-identity review.",
    )
    excluded_names = {
        normalize(n)
        for n in [
            "Adolf Hitler",
            "Heinrich Himmler",
            "Osama bin Laden",
            "Pol Pot",
            "Joseph Stalin",
            "Mao Zedong",
            "Joseph Goebbels",
            "Hermann Göring",
            "Adolf Eichmann",
            "Josef Mengele",
            "Idi Amin",
            "Saddam Hussein",
            "Abu Bakr al-Baghdadi",
        ]
    }
    names |= excluded_names
    counts = Counter(r["category"] for r in accepted)
    rejected = (
        json.loads((WORK / "rejected.json").read_text())
        if (WORK / "rejected.json").exists()
        else []
    )
    # Transient network failures remain retryable on resume; they are not
    # judgments about identity or image quality.
    rejected_titles = {
        r["title"]
        for r in rejected
        if not r["reason"].startswith(
            ("URLError", "HTTPError", "TimeoutError", "ConnectionError")
        )
    }
    for category, (_, _, target_count) in LANES.items():
        if args.category and category != args.category:
            continue
        pool = [
            c
            for c in candidates
            if c["category"] == category and c["title"] not in rejected_titles
        ]
        for offset in range(0, len(pool), 40):
            if counts[category] >= target_count or (
                args.limit and len(accepted) >= args.limit
            ):
                break
            batch = enrich(page_batch(pool[offset : offset + 40]))
            selected = []
            for row in batch:
                if row["wikidataId"] in entity_ids or (
                    normalize(row["name"]) in names
                    and row["kind"] != "religious_figure"
                ):
                    continue
                selected.append(row)
            remaining = target_count - counts[category]
            if args.limit:
                remaining = min(remaining, args.limit - len(accepted))
            selected = source_contexts(selected[:remaining])
            queue_repairs(
                [r for r in selected if not r.get("file")],
                "Recognized canonical identity has no declared lead image; find an exact alternative source.",
            )
            selected = [r for r in selected if r.get("file")]
            for row in selected:
                entity_ids.add(row["wikidataId"])
                names.add(normalize(row["name"]))
            pairs = []
            for start in range(0, len(selected), 5):
                pairs.extend(image_batch(selected[start : start + 5]))
            with ThreadPoolExecutor(max_workers=args.workers) as executor:
                futures = {executor.submit(acquire, pair): pair[0] for pair in pairs}
                for future in as_completed(futures):
                    row = futures[future]
                    try:
                        result, reason = future.result()
                    except (OSError, ValueError, subprocess.SubprocessError) as exc:
                        result, reason = None, f"{type(exc).__name__}: {str(exc)[:180]}"
                    if result:
                        identity, asset = result
                        accepted.append(identity)
                        new_assets.append(asset)
                        counts[category] += 1
                    else:
                        queue_repairs([row], reason)
                        rejected.append(
                            {
                                "title": row["title"],
                                "wikidataId": row["wikidataId"],
                                "reason": reason,
                            }
                        )
            # Commit a bounded batch atomically; interrupted runs resume without
            # replacing prior identity/assets or downloading completed portraits.
            dump(
                IDENTITIES,
                old + sorted(accepted, key=lambda r: (r["category"], r["name"])),
            )
            dump(ART / "manifest.json", sorted(new_assets, key=lambda r: r["id"]))
            dump(WORK / "rejected.json", rejected)
            print(
                "Accepted",
                len(accepted),
                dict(counts),
                "rejected",
                len(rejected),
                flush=True,
            )
    dump(
        WORK / "summary.json",
        {
            "accepted": len(accepted),
            "totalWithExisting": len(old) + len(accepted),
            "categories": dict(counts),
            "rejected": len(rejected),
            "providerCalls": 0,
        },
    )


if __name__ == "__main__":
    main()
