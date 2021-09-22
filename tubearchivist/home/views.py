"""
Functionality:
- all views for home app
- process post data received from frontend via ajax
"""

import json
import urllib.parse
from time import sleep

from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils.http import urlencode
from django.views import View
from home.src.config import AppConfig
from home.src.download import ChannelSubscription, PendingList
from home.src.helper import (
    get_dl_message,
    get_message,
    process_url_list,
    set_message,
)
from home.src.index import WatchState
from home.src.searching import Pagination, SearchForm, SearchHandler
from home.tasks import (
    download_pending,
    download_single,
    extrac_dl,
    run_backup,
    run_manual_import,
    run_restore_backup,
    update_subscribed,
)


class HomeView(View):
    """resolves to /
    handle home page and video search post functionality
    """

    CONFIG = AppConfig().config
    ES_URL = CONFIG["application"]["es_url"]

    def get(self, request):
        """return home search results"""
        colors, sort_order, hide_watched = self.read_config()
        # handle search
        search_get = request.GET.get("search", False)
        if search_get:
            search_encoded = urllib.parse.quote(search_get)
        else:
            search_encoded = False
        # define page size
        page_get = int(request.GET.get("page", 0))
        pagination_handler = Pagination(page_get, search_encoded)

        url = self.ES_URL + "/ta_video/_search"

        data = self.build_data(
            pagination_handler, sort_order, search_get, hide_watched
        )

        search = SearchHandler(url, data)
        videos_hits = search.get_data()
        max_hits = search.max_hits
        pagination_handler.validate(max_hits)
        context = {
            "videos": videos_hits,
            "pagination": pagination_handler.pagination,
            "sortorder": sort_order,
            "hide_watched": hide_watched,
            "colors": colors,
        }
        return render(request, "home/home.html", context)

    @staticmethod
    def build_data(pagination_handler, sort_order, search_get, hide_watched):
        """build the data dict for the search query"""
        page_size = pagination_handler.pagination["page_size"]
        page_from = pagination_handler.pagination["page_from"]
        data = {
            "size": page_size,
            "from": page_from,
            "query": {"match_all": {}},
            "sort": [
                {"published": {"order": "desc"}},
                {"date_downloaded": {"order": "desc"}},
            ],
        }
        # define sort
        if sort_order == "downloaded":
            del data["sort"][0]
        if search_get:
            del data["sort"]
        if hide_watched:
            data["query"] = {"term": {"player.watched": {"value": False}}}
        if search_get:
            query = {
                "multi_match": {
                    "query": search_get,
                    "fields": ["title", "channel.channel_name", "tags"],
                    "type": "cross_fields",
                    "operator": "and",
                }
            }
            data["query"] = query

        return data

    @staticmethod
    def read_config():
        """read needed values from redis"""
        config_handler = AppConfig().config
        colors = config_handler["application"]["colors"]
        sort_order = get_message("sort_order")
        hide_watched = get_message("hide_watched")
        return colors, sort_order, hide_watched

    @staticmethod
    def post(request):
        """handle post from search form"""
        post_data = dict(request.POST)
        search_query = post_data["videoSearch"][0]
        search_url = "/?" + urlencode({"search": search_query})
        return redirect(search_url, permanent=True)


class AboutView(View):
    """resolves to /about/
    show helpful how to information
    """

    @staticmethod
    def get(request):
        """handle http get"""
        config = AppConfig().config
        colors = config["application"]["colors"]
        context = {"title": "About", "colors": colors}
        return render(request, "home/about.html", context)


class DownloadView(View):
    """resolves to /download/
    takes POST for downloading youtube links
    """

    def get(self, request):
        """handle get requests"""
        config = AppConfig().config
        colors = config["application"]["colors"]

        page_get = int(request.GET.get("page", 0))
        pagination_handler = Pagination(page_get)

        url = config["application"]["es_url"] + "/ta_download/_search"
        data = self.build_data(pagination_handler)
        search = SearchHandler(url, data, cache=False)

        videos_hits = search.get_data()
        max_hits = search.max_hits

        if videos_hits:
            all_pending = [i["source"] for i in videos_hits]
            pagination_handler.validate(max_hits)
            pagination = pagination_handler.pagination
        else:
            all_pending = False
            pagination = False

        context = {
            "pending": all_pending,
            "max_hits": max_hits,
            "pagination": pagination,
            "title": "Downloads",
            "colors": colors,
        }
        return render(request, "home/downloads.html", context)

    @staticmethod
    def build_data(pagination_handler):
        """build data dict for search"""
        page_size = pagination_handler.pagination["page_size"]
        page_from = pagination_handler.pagination["page_from"]
        data = {
            "size": page_size,
            "from": page_from,
            "query": {"term": {"status": {"value": "pending"}}},
            "sort": [{"timestamp": {"order": "desc"}}],
        }
        return data

    @staticmethod
    def post(request):
        """handle post requests"""
        download_post = dict(request.POST)
        if "vid-url" in download_post.keys():
            url_str = download_post["vid-url"]
            print("adding to queue")
            youtube_ids = process_url_list(url_str)
            if not youtube_ids:
                # failed to process
                print(url_str)
                mess_dict = {
                    "status": "downloading",
                    "level": "error",
                    "title": "Failed to extract links.",
                    "message": "",
                }
                set_message("progress:download", mess_dict)
                return redirect("downloads")

            print(youtube_ids)
            extrac_dl.delay(youtube_ids)

        sleep(2)
        return redirect("downloads", permanent=True)


class ChannelIdView(View):
    """resolves to /channel/<channel-id>/
    display single channel page from channel_id
    """

    def get(self, request, channel_id_detail):
        """get method"""
        es_url, colors = self.read_config()
        context = self.get_channel_videos(request, channel_id_detail, es_url)
        context.update({"colors": colors})
        return render(request, "home/channel_id.html", context)

    @staticmethod
    def read_config():
        """read config file"""
        config = AppConfig().config
        es_url = config["application"]["es_url"]
        colors = config["application"]["colors"]
        return es_url, colors

    def get_channel_videos(self, request, channel_id_detail, es_url):
        """get channel from video index"""
        page_get = int(request.GET.get("page", 0))
        pagination_handler = Pagination(page_get)
        # get data
        url = es_url + "/ta_video/_search"
        data = self.build_data(pagination_handler, channel_id_detail)
        search = SearchHandler(url, data)
        videos_hits = search.get_data()
        max_hits = search.max_hits
        if max_hits:
            channel_info = videos_hits[0]["source"]["channel"]
            channel_name = channel_info["channel_name"]
            pagination_handler.validate(max_hits)
            pagination = pagination_handler.pagination
        else:
            # get details from channel index when when no hits
            channel_info, channel_name = self.get_channel_info(
                channel_id_detail, es_url
            )
            videos_hits = False
            pagination = False

        context = {
            "channel_info": channel_info,
            "videos": videos_hits,
            "max_hits": max_hits,
            "pagination": pagination,
            "title": "Channel: " + channel_name,
        }

        return context

    @staticmethod
    def build_data(pagination_handler, channel_id_detail):
        """build data dict for search"""
        page_size = pagination_handler.pagination["page_size"]
        page_from = pagination_handler.pagination["page_from"]
        data = {
            "size": page_size,
            "from": page_from,
            "query": {
                "term": {"channel.channel_id": {"value": channel_id_detail}}
            },
            "sort": [
                {"published": {"order": "desc"}},
                {"date_downloaded": {"order": "desc"}},
            ],
        }
        return data

    @staticmethod
    def get_channel_info(channel_id_detail, es_url):
        """get channel info from channel index if no videos"""
        url = f"{es_url}/ta_channel/_doc/{channel_id_detail}"
        data = False
        search = SearchHandler(url, data)
        channel_data = search.get_data()
        channel_info = channel_data[0]["source"]
        channel_name = channel_info["channel_name"]
        return channel_info, channel_name


class ChannelView(View):
    """resolves to /channel/
    handle functionality for channel overview page, subscribe to channel,
    search as you type for channel name
    """

    def get(self, request):
        """handle http get requests"""
        es_url, colors = self.read_config()
        page_get = int(request.GET.get("page", 0))
        pagination_handler = Pagination(page_get)
        page_size = pagination_handler.pagination["page_size"]
        page_from = pagination_handler.pagination["page_from"]
        # get
        url = es_url + "/ta_channel/_search"
        data = {
            "size": page_size,
            "from": page_from,
            "query": {"match_all": {}},
            "sort": [{"channel_name.keyword": {"order": "asc"}}],
        }
        show_subed_only = get_message("show_subed_only")
        if show_subed_only:
            data["query"] = {"term": {"channel_subscribed": {"value": True}}}
        search = SearchHandler(url, data)
        channel_hits = search.get_data()
        max_hits = search.max_hits
        pagination_handler.validate(search.max_hits)
        context = {
            "channels": channel_hits,
            "max_hits": max_hits,
            "pagination": pagination_handler.pagination,
            "show_subed_only": show_subed_only,
            "title": "Channels",
            "colors": colors,
        }
        return render(request, "home/channel.html", context)

    @staticmethod
    def read_config():
        """read config file"""
        config = AppConfig().config
        es_url = config["application"]["es_url"]
        colors = config["application"]["colors"]
        return es_url, colors

    def post(self, request):
        """handle http post requests"""
        subscriptions_post = dict(request.POST)
        print(subscriptions_post)
        subscriptions_post = dict(request.POST)
        if "subscribe" in subscriptions_post.keys():
            sub_str = subscriptions_post["subscribe"]
            try:
                youtube_ids = process_url_list(sub_str)
                self.subscribe_to(youtube_ids)
            except ValueError:
                print("parsing subscribe ids failed!")
                print(sub_str)

        sleep(1)
        return redirect("channel", permanent=True)

    @staticmethod
    def subscribe_to(youtube_ids):
        """process the subscribe ids"""
        for youtube_id in youtube_ids:
            if youtube_id["type"] == "video":
                to_sub = youtube_id["url"]
                vid_details = PendingList().get_youtube_details(to_sub)
                channel_id_sub = vid_details["channel_id"]
            elif youtube_id["type"] == "channel":
                channel_id_sub = youtube_id["url"]
            else:
                raise ValueError("failed to subscribe to: " + youtube_id)

            ChannelSubscription().change_subscribe(
                channel_id_sub, channel_subscribed=True
            )
            print("subscribed to: " + channel_id_sub)


class VideoView(View):
    """resolves to /video/<video-id>/
    display details about a single video
    """

    def get(self, request, video_id):
        """get single video"""
        es_url, colors = self.read_config()
        url = f"{es_url}/ta_video/_doc/{video_id}"
        data = None
        look_up = SearchHandler(url, data)
        video_hit = look_up.get_data()
        video_data = video_hit[0]["source"]
        video_title = video_data["title"]
        context = {"video": video_data, "title": video_title, "colors": colors}
        return render(request, "home/video.html", context)

    @staticmethod
    def read_config():
        """read config file"""
        config = AppConfig().config
        es_url = config["application"]["es_url"]
        colors = config["application"]["colors"]
        return es_url, colors


class SettingsView(View):
    """resolves to /settings/
    handle the settings page, display current settings,
    take post request from the form to update settings
    """

    @staticmethod
    def get(request):
        """read and display current settings"""
        config = AppConfig().config
        colors = config["application"]["colors"]

        context = {"title": "Settings", "config": config, "colors": colors}

        return render(request, "home/settings.html", context)

    @staticmethod
    def post(request):
        """handle form post to update settings"""
        form_post = dict(request.POST)
        del form_post["csrfmiddlewaretoken"]
        print(form_post)
        config_handler = AppConfig()
        config_handler.update_config(form_post)

        return redirect("settings", permanent=True)


def progress(request):
    # pylint: disable=unused-argument
    """endpoint for download progress ajax calls"""
    config = AppConfig().config
    cache_dir = config["application"]["cache_dir"]
    json_data = get_dl_message(cache_dir)
    return JsonResponse(json_data)


def process(request):
    """handle all the buttons calls via POST ajax"""
    if request.method == "POST":
        post_dict = json.loads(request.body.decode())
        post_handler = PostData(post_dict)
        if post_handler.to_exec:
            task_result = post_handler.run_task()
            return JsonResponse(task_result)

    return JsonResponse({"success": False})


class PostData:
    """
    map frontend http post values to backend funcs
    handover long running tasks to celery
    """

    def __init__(self, post_dict):
        self.post_dict = post_dict
        self.to_exec, self.exec_val = list(post_dict.items())[0]

    def run_task(self):
        """execute and return task result"""
        to_exec = self.exec_map()
        task_result = to_exec()
        return task_result

    def exec_map(self):
        """map dict key and return function to execute"""
        exec_map = {
            "watched": self.watched,
            "rescan_pending": self.rescan_pending,
            "ignore": self.ignore,
            "dl_pending": self.dl_pending,
            "unsubscribe": self.unsubscribe,
            "sort_order": self.sort_order,
            "hide_watched": self.hide_watched,
            "show_subed_only": self.show_subed_only,
            "dlnow": self.dlnow,
            "manual-import": self.manual_import,
            "db-backup": self.db_backup,
            "db-restore": self.db_restore,
            "channel-search": self.channel_search,
        }

        return exec_map[self.to_exec]

    def watched(self):
        """mark as watched"""
        WatchState(self.exec_val).mark_as_watched()
        return {"success": True}

    @staticmethod
    def rescan_pending():
        """look for new items in subscribed channels"""
        print("rescan subscribed channels")
        update_subscribed.delay()
        return {"success": True}

    def ignore(self):
        """ignore from download queue"""
        print("ignore video")
        handler = PendingList()
        ignore_list = self.exec_val
        handler.ignore_from_pending([ignore_list])
        return {"success": True}

    @staticmethod
    def dl_pending():
        """start the download queue"""
        print("download pending")
        download_pending.delay()
        return {"success": True}

    def unsubscribe(self):
        """unsubscribe from channel"""
        channel_id_unsub = self.exec_val
        print("unsubscribe from " + channel_id_unsub)
        ChannelSubscription().change_subscribe(
            channel_id_unsub, channel_subscribed=False
        )
        return {"success": True}

    def sort_order(self):
        """change the sort between published to downloaded"""
        sort_order = self.exec_val
        set_message("sort_order", sort_order, expire=False)
        return {"success": True}

    def hide_watched(self):
        """toggle if to show watched vids or not"""
        hide_watched = bool(int(self.exec_val))
        print(f"hide watched: {hide_watched}")
        set_message("hide_watched", hide_watched, expire=False)
        return {"success": True}

    def show_subed_only(self):
        """show or hide subscribed channels only on channels page"""
        show_subed_only = bool(int(self.exec_val))
        print(f"show subed only: {show_subed_only}")
        set_message("show_subed_only", show_subed_only, expire=False)
        return {"success": True}

    def dlnow(self):
        """start downloading single vid now"""
        youtube_id = self.exec_val
        print("downloading: " + youtube_id)
        download_single.delay(youtube_id=youtube_id)
        return {"success": True}

    @staticmethod
    def manual_import():
        """run manual import from settings page"""
        print("starting manual import")
        run_manual_import.delay()
        return {"success": True}

    @staticmethod
    def db_backup():
        """backup es to zip from settings page"""
        print("backing up database")
        run_backup.delay()
        return {"success": True}

    @staticmethod
    def db_restore():
        """restore es zip from settings page"""
        print("restoring index from backup zip")
        run_restore_backup.delay()
        return {"success": True}

    def channel_search(self):
        """search for channel name as_you_type"""
        search_query = self.exec_val
        print("searching for: " + search_query)
        search_results = SearchForm().search_channels(search_query)
        return search_results
