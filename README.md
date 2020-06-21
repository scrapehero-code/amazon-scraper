# Amazon Scraper using Selectorlib 

A simple amazon scraper to extract product details and prices from Amazon.com using Python Requests and Selectorlib. 

Full article at [ScrapeHero Tutorials](https://www.scrapehero.com/tutorial-how-to-scrape-amazon-product-details-using-python-and-selectorlib/)

There are two simple scrapers in this project. 
1. Amazon Product Page Scraper `amazon.py`
1. Amazon Search Results Page Scraper `searchresults.py`

Note: A completely web browser based commercial version of these scrapers are available in [ScrapeHero Marketplace](https://www.scrapehero.com/marketplace/)
## Usage

From a terminal 

1. Clone this project  `git clone https://github.com/scrapehero-code/amazon-scraper.git` and cd into it `cd amazon-scraper`
1. Add a Virtual Environment `python3 -m venv .venv` (Optional)
1. Activate the Virtual Environment `source .venv/bin/activate` (Optional) 
1. Install Requirements `pip3 install -r requirements.txt`

## Scrape Product Details from Product Page

1. Add Amazon Product URLS to [urls.txt](urls.txt)
1. Run `python3 amazon.py`
1. Get data from [output.jsonl](output.jsonl)

## Scrape Products from Search Results

This scraper only scrapes product from the first page of search results

1. Add Amazon Product URLS to [search_results_urls.txt](search_results_urls.txt)
1. Run `python3 searchresults.py`
1. Get data from [search_results_output.jsonl](search_results_output.jsonl)

## Example Data Format

### Product Details
```json
{
  "name": "2020 HP 15.6\" Laptop Computer, 10th Gen Intel Quard-Core i7 1065G7 up to 3.9GHz, 16GB DDR4 RAM, 512GB PCIe SSD, 802.11ac WiFi, Bluetooth 4.2, Silver, Windows 10, YZAKKA USB External DVD + Accessories",
  "price": "$959.00",
  "short_description": "Powered by latest 10th Gen Intel Core i7-1065G7 Processor @ 1.30GHz (4 Cores, 8M Cache, up to 3.90 GHz); Ultra-low-voltage platform. Quad-core, eight-way processing provides maximum high-efficiency power to go.\n15.6\" diagonal HD SVA BrightView micro-edge WLED-backlit, 220 nits, 45% NTSC (1366 x 768) Display; Intel Iris Plus Graphics\n16GB 2666MHz DDR4 Memory for full-power multitasking; 512GB Solid State Drive (PCI-e), Save files fast and store more data. With massive amounts of storage and advanced communication power, PCI-e SSDs are great for major gaming applications, multiple servers, daily backups, and more.\nRealtek RTL8821CE 802.11b/g/n/ac (1x1) Wi-Fi and Bluetooth 4.2 Combo; 1 USB 3.1 Gen 1 Type-C (Data Transfer Only, 5 Gb/s signaling rate); 2 USB 3.1 Gen 1 Type-A (Data Transfer Only); 1 AC smart pin; 1 HDMI 1.4b; 1 headphone/microphone combo\nWindows 10 Home, 64-bit, English; Natural silver; YZAKKA USB External DVD drive + USB extension cord 6ft, HDMI cable 6ft and Mouse Pad\n› See more product details",
  "images": "{\"https://images-na.ssl-images-amazon.com/images/I/61CBqERgZ7L._AC_SX425_.jpg\":[425,425],\"https://images-na.ssl-images-amazon.com/images/I/61CBqERgZ7L._AC_SX466_.jpg\":[466,466],\"https://images-na.ssl-images-amazon.com/images/I/61CBqERgZ7L._AC_SY355_.jpg\":[355,355],\"https://images-na.ssl-images-amazon.com/images/I/61CBqERgZ7L._AC_SX569_.jpg\":[569,569],\"https://images-na.ssl-images-amazon.com/images/I/61CBqERgZ7L._AC_SY450_.jpg\":[450,450],\"https://images-na.ssl-images-amazon.com/images/I/61CBqERgZ7L._AC_SX679_.jpg\":[679,679],\"https://images-na.ssl-images-amazon.com/images/I/61CBqERgZ7L._AC_SX522_.jpg\":[522,522]}",
  "variants": [
    {
      "name": "Click to select 4GB DDR4 RAM, 128GB PCIe SSD",
      "asin": "B01MCZ4LH1"
    },
    {
      "name": "Click to select 8GB DDR4 RAM, 256GB PCIe SSD",
      "asin": "B08537NR9D"
    },
    {
      "name": "Click to select 12GB DDR4 RAM, 512GB PCIe SSD",
      "asin": "B08537ZDYH"
    },
    {
      "name": "Click to select 16GB DDR4 RAM, 512GB PCIe SSD",
      "asin": "B085383P7M"
    },
    {
      "name": "Click to select 20GB DDR4 RAM, 1TB PCIe SSD",
      "asin": "B08537NDVZ"
    }
  ],
  "product_description": "Capacity:16GB DDR4 RAM, 512GB PCIe SSD\n\nProcessor\n\n  Intel Core i7-1065G7 (1.3 GHz base frequency, up to 3.9 GHz with Intel Turbo Boost Technology, 8 MB cache, 4 cores)\n\nChipset\n\n  Intel Integrated SoC\n\nMemory\n\n  16GB DDR4-2666 SDRAM\n\nVideo graphics\n\n  Intel Iris Plus Graphics\n\nHard drive\n\n  512GB PCIe NVMe M.2 SSD\n\nDisplay\n\n  15.6\" diagonal HD SVA BrightView micro-edge WLED-backlit, 220 nits, 45% NTSC (1366 x 768)\n\nWireless connectivity\n\n  Realtek RTL8821CE 802.11b/g/n/ac (1x1) Wi-Fi and Bluetooth 4.2 Combo\n\nExpansion slots\n\n  1 multi-format SD media card reader\n\nExternal ports\n\n  1 USB 3.1 Gen 1 Type-C (Data Transfer Only, 5 Gb/s signaling rate); 2 USB 3.1 Gen 1 Type-A (Data Transfer Only); 1 AC smart pin; 1 HDMI 1.4b; 1 headphone/microphone combo\n\nMinimum dimensions (W x D x H)\n\n  9.53 x 14.11 x 0.70 in\n\nWeight\n\n  3.75 lbs\n\nPower supply type\n\n  45 W Smart AC power adapter\n\nBattery type\n\n  3-cell, 41 Wh Li-ion\n\nBattery life mixed usage\n\n  Up to 11 hours and 30 minutes\n\n  Video Playback Battery life\n\n  Up to 10 hours\n\nWebcam\n\n  HP TrueVision HD Camera with integrated dual array digital microphone\n\nAudio features\n\n  Dual speakers\n\nOperating system\n\n  Windows 10 Home 64\n\nAccessories\n\n  YZAKKA USB External DVD drive + USB extension cord 6ft, HDMI cable 6ft and Mouse Pad",
  "link_to_all_reviews": "https://www.amazon.com/HP-Computer-Quard-Core-Bluetooth-Accessories/product-reviews/B085383P7M/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews"
}
```

### Search Results 
Each result would look similar

```json
{
    "title": "New ! Dell Inspiron i3583 15.6\" HD Touch-Screen Laptop - Intel i3-8145U - 8GB DDR4-128GB SSD - Windows 10 - Wireless-AC - Bluetooth - SD Card Reader - HDMI & USB 3.1 -Waves MaxxAudio Pro- Black",
    "url": "/Dell-Inspiron-i3583-Touch-Screen-Laptop/dp/B08173ZTJX/ref=sr_1_3?dchild=1&keywords=laptops&qid=1591584632&sr=8-3",
    "rating": "4.1 out of 5 stars",
    "reviews": "122",
    "price": "$472.00",
    "search_url": "https://www.amazon.com/s?k=laptops"
}
```
