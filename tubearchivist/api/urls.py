"""all api urls"""

from api.views import (
    ChannelApiListView,
    ChannelApiVideoView,
    ChannelApiView,
    CookieView,
    DownloadApiListView,
    DownloadApiView,
    LoginApiView,
    PingView,
    PlaylistApiListView,
    PlaylistApiVideoView,
    PlaylistApiView,
    RefreshView,
    SearchView,
    SnapshotApiListView,
    SnapshotApiView,
    TaskApiView,
    VideoApiListView,
    VideoApiView,
    VideoCommentView,
    VideoProgressView,
    VideoSimilarView,
    VideoSponsorView,
    WatchedView,
    TokenView,
)
from django.urls import path

urlpatterns = [
    path("ping/", PingView.as_view(), name="ping"),
    path("login/", LoginApiView.as_view(), name="api-login"),
    path(
        "video/",
        VideoApiListView.as_view(),
        name="api-video-list",
    ),
    path(
        "video/<slug:video_id>/",
        VideoApiView.as_view(),
        name="api-video",
    ),
    path(
        "video/<slug:video_id>/progress/",
        VideoProgressView.as_view(),
        name="api-video-progress",
    ),
    path(
        "video/<slug:video_id>/comment/",
        VideoCommentView.as_view(),
        name="api-video-comment",
    ),
    path(
        "video/<slug:video_id>/similar/",
        VideoSimilarView.as_view(),
        name="api-video-similar",
    ),
    path(
        "video/<slug:video_id>/sponsor/",
        VideoSponsorView.as_view(),
        name="api-video-sponsor",
    ),
    path(
        "channel/",
        ChannelApiListView.as_view(),
        name="api-channel-list",
    ),
    path(
        "channel/<slug:channel_id>/",
        ChannelApiView.as_view(),
        name="api-channel",
    ),
    path(
        "channel/<slug:channel_id>/video/",
        ChannelApiVideoView.as_view(),
        name="api-channel-video",
    ),
    path(
        "playlist/",
        PlaylistApiListView.as_view(),
        name="api-playlist-list",
    ),
    path(
        "playlist/<slug:playlist_id>/",
        PlaylistApiView.as_view(),
        name="api-playlist",
    ),
    path(
        "playlist/<slug:playlist_id>/video/",
        PlaylistApiVideoView.as_view(),
        name="api-playlist-video",
    ),
    path(
        "download/",
        DownloadApiListView.as_view(),
        name="api-download-list",
    ),
    path(
        "download/<slug:video_id>/",
        DownloadApiView.as_view(),
        name="api-download",
    ),
    path(
        "refresh/",
        RefreshView.as_view(),
        name="api-refresh",
    ),
    path(
        "task/",
        TaskApiView.as_view(),
        name="api-task",
    ),
    path(
        "snapshot/",
        SnapshotApiListView.as_view(),
        name="api-snapshot-list",
    ),
    path(
        "snapshot/<slug:snapshot_id>/",
        SnapshotApiView.as_view(),
        name="api-snapshot",
    ),
    path(
        "cookie/",
        CookieView.as_view(),
        name="api-cookie",
    ),
    path(
        "watched/",
        WatchedView.as_view(),
        name="api-watched",
    ),
    path(
        "search/",
        SearchView.as_view(),
        name="api-search",
    ),
    path(
        "token/",
        TokenView.as_view(),
        name="api-token",
    ),
]
