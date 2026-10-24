"""Small FastAPI app. The page calls it to start a scrape and to check progress."""
import os
import time
import threading
import traceback
from typing import Literal

from fastapi import BackgroundTasks, FastAPI

import searchresults

COOLDOWN = int(os.getenv("COOLDOWN", "60"))  # min seconds between two "all" scrapes

app = FastAPI()
lock = threading.Lock()
state = {"running": False, "message": "Idle", "last_finished": 0.0}


def job(mode):
    try:
        state["message"] = searchresults.run(mode)
    except Exception as e:
        traceback.print_exc()
        state["message"] = "Error: %s" % e
    finally:
        state["last_finished"] = time.time()
        state["running"] = False



@app.post("/api/scrape")
def start_scrape(background_tasks: BackgroundTasks, mode: Literal["new", "all"] = "new"):
    with lock:
        if state["running"]:
            return {"started": False, "running": True, "message": "A scrape is already running."}

        wait = COOLDOWN - (time.time() - state["last_finished"])
        if mode == "all" and wait > 0:
            return {"started": False, "running": False,
                    "message": "Please wait %d seconds before re-scraping everything." % wait}

        state["running"] = True

    background_tasks.add_task(job, mode)
    return {"started": True, "running": True, "message": "Started."}



@app.get("/api/status")
def get_status():
    return {"running": state["running"], "message": state["message"]}