from selectorlib import Extractor
import requests 
import os
import json 
from time import sleep


SLEEP_FOR_N_SECONDS = 0
# Create an Extractor by reading from the YAML file
e = Extractor.from_yaml_file('search_results.yml')

def scrape(url):  

    headers = {
        'dnt': '1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'referer': 'https://www.amazon.com/',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    }

    # Download the page using requests
    print("Downloading %s"%url)
    r = requests.get(url, headers=headers)
    # Simple check to check if page was blocked (Usually 503)
    if r.status_code > 500:
        if "To discuss automated access to Amazon data please contact" in r.text:
            print("Page %s was blocked by Amazon. Please try using better proxies\n"%url)
        else:
            print("Page %s must have been blocked by Amazon as the status code was %d"%(url,r.status_code))
        return None
    # Pass the HTML of the page and create 
    return e.extract(r.text)

# product_data = []
with open("search_results_urls.txt",'r') as urllist, open('search_results_output.json','w') as outfile:
    outfile.write("[") #json object opening
    for url in urllist.read().splitlines():
        if url:
            data = scrape(url) 
            if data:
                for product in data['products']:
                    product['search_url'] = url
                    print("Saving Product: %s"%product['title'])
                    json.dump(product,outfile)
                    outfile.write(",\n")
                        
    sleep(SLEEP_FOR_N_SECONDS) #wait for n seconds for the new product type

    # remove the final comma
    outfile.seek(-1, os.SEEK_END)
    outfile.truncate()

    outfile.write("]") #json object closing
    