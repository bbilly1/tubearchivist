function sortChange(sortValue) {
    var payload = JSON.stringify({'sort_order': sortValue});
    sendPost(payload);
    setTimeout(function(){
        location.reload();
        return false;
    }, 500);
}

// Updates video watch status when passed a video id and it's current state (ex if the video was unwatched but you want to mark it as watched you will pass "unwatched")
function updateVideoWatchStatus(input1, videoCurrentWatchStatus) {
    if (videoCurrentWatchStatus) {
        videoId = input1;
    } else if (input1.getAttribute("data-id")) {
        videoId = input1.getAttribute("data-id");
        videoCurrentWatchStatus = input1.getAttribute("data-status");
    }

    postVideoProgress(videoId, 0); // Reset video progress on watched/unwatched;
    removeProgressBar(videoId);

    if (videoCurrentWatchStatus == "watched") {
        var watchStatusIndicator = createWatchStatusIndicator(videoId, "unwatched");
        var payload = JSON.stringify({'un_watched': videoId});
        sendPost(payload);
    } else if (videoCurrentWatchStatus == "unwatched") {
        var watchStatusIndicator = createWatchStatusIndicator(videoId, "watched");
        var payload = JSON.stringify({'watched': videoId});
        sendPost(payload);
    }

    var watchButtons = document.getElementsByClassName("watch-button");
    for (let i = 0; i < watchButtons.length; i++) {
        if (watchButtons[i].getAttribute("data-id") == videoId) {
            watchButtons[i].outerHTML = watchStatusIndicator;
        }
    }
}

// Creates a watch status indicator when passed a video id and the videos watch status
function createWatchStatusIndicator(videoId, videoWatchStatus) {
    if (videoWatchStatus == "watched") {
        var seen = "seen";
        var title = "Mark as unwatched";
    } else if (videoWatchStatus == "unwatched") {
        var seen = "unseen";
        var title = "Mark as watched";
    }
    var watchStatusIndicator = `<img src="/static/img/icon-${seen}.svg" alt="${seen}-icon" data-id="${videoId}" data-status="${videoWatchStatus}" onclick="updateVideoWatchStatus(this)" class="watch-button" title="${title}">`;
    return watchStatusIndicator;
}

// function isWatched(youtube_id) {
//     var payload = JSON.stringify({'watched': youtube_id});
//     sendPost(payload);
//     var seenIcon = document.createElement('img');
//     seenIcon.setAttribute('src', "/static/img/icon-seen.svg");
//     seenIcon.setAttribute('alt', 'seen-icon');
//     seenIcon.setAttribute('id', youtube_id);
//     seenIcon.setAttribute('title', "Mark as unwatched");
//     seenIcon.setAttribute('onclick', "isUnwatched(this.id)");
//     seenIcon.classList = 'seen-icon';
//     document.getElementById(youtube_id).replaceWith(seenIcon);
// }

// Removes the progress bar when passed a video id
function removeProgressBar(videoId) {
    setProgressBar(videoId, 0, 1);
}

function isWatchedButton(button) {
    youtube_id = button.getAttribute("data-id");
    var payload = JSON.stringify({'watched': youtube_id});
    button.remove();
    sendPost(payload);
    setTimeout(function(){
        location.reload();
        return false;
    }, 1000);
}

// function isUnwatched(youtube_id) {
//     postVideoProgress(youtube_id, 0); // Reset video progress on unwatched;
//     var payload = JSON.stringify({'un_watched': youtube_id});
//     sendPost(payload);
//     var unseenIcon = document.createElement('img');
//     unseenIcon.setAttribute('src', "/static/img/icon-unseen.svg");
//     unseenIcon.setAttribute('alt', 'unseen-icon');
//     unseenIcon.setAttribute('id', youtube_id);
//     unseenIcon.setAttribute('title', "Mark as watched");
//     unseenIcon.setAttribute('onclick', "isWatched(this.id)");
//     unseenIcon.classList = 'unseen-icon';
//     document.getElementById(youtube_id).replaceWith(unseenIcon);
// }

function unsubscribe(id_unsub) {
    var payload = JSON.stringify({'unsubscribe': id_unsub});
    sendPost(payload);
    var message = document.createElement('span');
    message.innerText = "You are unsubscribed.";
    document.getElementById(id_unsub).replaceWith(message);
}

function subscribe(id_sub) {
    var payload = JSON.stringify({'subscribe': id_sub});
    sendPost(payload);
    var message = document.createElement('span');
    message.innerText = "You are subscribed.";
    document.getElementById(id_sub).replaceWith(message);
}

function changeView(image) {
    var sourcePage = image.getAttribute("data-origin");
    var newView = image.getAttribute("data-value");
    var payload = JSON.stringify({'change_view': sourcePage + ":" + newView});
    sendPost(payload);
    setTimeout(function(){
        location.reload();
        return false;
    }, 500);
}

function changeGridItems(image) {
    var operator = image.getAttribute("data-value");
    var payload = JSON.stringify({'change_grid': operator});
    sendPost(payload);
    setTimeout(function(){
        location.reload();
        return false;
    }, 500);
}

function toggleCheckbox(checkbox) {
    // pass checkbox id as key and checkbox.checked as value
    var toggleId = checkbox.id;
    var toggleVal = checkbox.checked;
    var payloadDict = {};
    payloadDict[toggleId] = toggleVal;
    var payload = JSON.stringify(payloadDict);
    sendPost(payload);
    setTimeout(function(){
        var currPage = window.location.pathname + window.location.search;
        window.location.replace(currPage);
        return false;
    }, 500);
}

// download page buttons
function rescanPending() {
    var payload = JSON.stringify({'rescan_pending': true});
    animate('rescan-icon', 'rotate-img');
    sendPost(payload);
    setTimeout(function(){
        checkMessages();
    }, 500);
}

function dlPending() {
    var payload = JSON.stringify({'dl_pending': true});
    animate('download-icon', 'bounce-img');
    sendPost(payload);
    setTimeout(function(){
        checkMessages();
    }, 500);
}

function toIgnore(button) {
    var youtube_id = button.getAttribute('data-id');
    var payload = JSON.stringify({'ignore': youtube_id});
    sendPost(payload);
    document.getElementById('dl-' + youtube_id).remove();
}

function downloadNow(button) {
    var youtube_id = button.getAttribute('data-id');
    var payload = JSON.stringify({'dlnow': youtube_id});
    sendPost(payload);
    document.getElementById(youtube_id).remove();
    setTimeout(function(){
        checkMessages();
    }, 500);
}

function forgetIgnore(button) {
    var youtube_id = button.getAttribute('data-id');
    var payload = JSON.stringify({'forgetIgnore': youtube_id});
    sendPost(payload);
    document.getElementById("dl-" + youtube_id).remove();
}

function addSingle(button) {
    var youtube_id = button.getAttribute('data-id');
    var payload = JSON.stringify({'addSingle': youtube_id});
    sendPost(payload);
    document.getElementById("dl-" + youtube_id).remove();
    setTimeout(function(){
        checkMessages();
    }, 500);
}

function deleteQueue(button) {
    var to_delete = button.getAttribute('data-id');
    var payload = JSON.stringify({'deleteQueue': to_delete});
    sendPost(payload);
    // clear button
    var message = document.createElement('p');
    message.innerText = 'deleting download queue: ' + to_delete;
    document.getElementById(button.id).replaceWith(message);
}

function stopQueue() {
    var payload = JSON.stringify({'queue': 'stop'});
    sendPost(payload);
    document.getElementById('stop-icon').remove();
}

function killQueue() {
    var payload = JSON.stringify({'queue': 'kill'});
    sendPost(payload);
    document.getElementById('kill-icon').remove();
}

// settings page buttons
function manualImport() {
    var payload = JSON.stringify({'manual-import': true});
    sendPost(payload);
    // clear button
    var message = document.createElement('p');
    message.innerText = 'processing import';
    var toReplace = document.getElementById('manual-import');
    toReplace.innerHTML = '';
    toReplace.appendChild(message);
}

function reEmbed() {
    var payload = JSON.stringify({'re-embed': true});
    sendPost(payload);
    // clear button
    var message = document.createElement('p');
    message.innerText = 'processing thumbnails';
    var toReplace = document.getElementById('re-embed');
    toReplace.innerHTML = '';
    toReplace.appendChild(message);
}

function dbBackup() {
    var payload = JSON.stringify({'db-backup': true});
    sendPost(payload);
    // clear button
    var message = document.createElement('p');
    message.innerText = 'backing up archive';
    var toReplace = document.getElementById('db-backup');
    toReplace.innerHTML = '';
    toReplace.appendChild(message);
}

function dbRestore(button) {
    var fileName = button.getAttribute("data-id");
    var payload = JSON.stringify({'db-restore': fileName});
    sendPost(payload);
    // clear backup row
    var message = document.createElement('p');
    message.innerText = 'restoring from backup';
    var toReplace = document.getElementById(fileName);
    toReplace.innerHTML = '';
    toReplace.appendChild(message);
}

function fsRescan() {
    var payload = JSON.stringify({'fs-rescan': true});
    sendPost(payload);
    // clear button
    var message = document.createElement('p');
    message.innerText = 'File system scan in progress';
    var toReplace = document.getElementById('fs-rescan');
    toReplace.innerHTML = '';
    toReplace.appendChild(message);
}

function resetToken() {
    var payload = JSON.stringify({'reset-token': true});
    sendPost(payload);
    var message = document.createElement("p");
    message.innerText = "Token revoked";
    document.getElementById("text-reveal").replaceWith(message);
}

// delete from file system
function deleteConfirm() {
    to_show = document.getElementById("delete-button");
    document.getElementById("delete-item").style.display = 'none';
    to_show.style.display = "block";
}

function deleteVideo(button) {
    var to_delete = button.getAttribute("data-id");
    var to_redirect = button.getAttribute("data-redirect");
    var payload = JSON.stringify({"delete-video": to_delete});
    sendPost(payload);
    setTimeout(function(){
        var redirect = "/channel/" + to_redirect;
        window.location.replace(redirect);
        return false;
    }, 1000);
}

function deleteChannel(button) {
    var to_delete = button.getAttribute("data-id");
    var payload = JSON.stringify({"delete-channel": to_delete});
    sendPost(payload);
    setTimeout(function(){
        window.location.replace("/channel/");
        return false;
    }, 1000);
}

function deletePlaylist(button) {
    var playlist_id = button.getAttribute("data-id");
    var playlist_action = button.getAttribute("data-action");
    var payload = JSON.stringify({
        "delete-playlist": {
            "playlist-id": playlist_id,
            "playlist-action": playlist_action
        }
    });
    sendPost(payload);
    setTimeout(function(){
        window.location.replace("/playlist/");
        return false;
    }, 1000);
}

function cancelDelete() {
    document.getElementById("delete-button").style.display = 'none';
    document.getElementById("delete-item").style.display = 'block';
}

// get seconds from hh:mm:ss.ms timestamp
function getSeconds(timestamp) {
    var elements = timestamp.split(":", 3);
    var secs = parseInt(elements[0]) * 60 * 60 + parseInt(elements[1]) * 60 + parseFloat(elements[2])
    return secs
}

// player
var sponsorBlock = [];
function createPlayer(button) {
    var videoId = button.getAttribute('data-id');
    var videoPosition = button.getAttribute('data-position');
    var videoData = getVideoData(videoId);

    var sponsorBlockElements = '';
    if (videoData.data.sponsorblock && videoData.data.sponsorblock.is_enabled) {
        sponsorBlock = videoData.data.sponsorblock;
        if (sponsorBlock.segments.length == 0) {
            sponsorBlockElements = `
            <div class="sponsorblock" id="sponsorblock">
                <h4>This video doesn't have any sponsor segments added. To add a segment go to <u><a href="https://www.youtube.com/watch?v=${videoId}">this video on Youtube</a></u> and add a segment using the <u><a href="https://sponsor.ajay.app/">SponsorBlock</a></u> extension.</h4>
            </div>
            `;
        } else {
            if (sponsorBlock.has_unlocked) {
                sponsorBlockElements = `
                <div class="sponsorblock" id="sponsorblock">
                    <h4>This video has unlocked sponsor segments. Go to <u><a href="https://www.youtube.com/watch?v=${videoId}">this video on YouTube</a></u> and vote on the segments using the <u><a href="https://sponsor.ajay.app/">SponsorBlock</a></u> extension.</h4>
                </div>
                `;
            }
        }
    } else {
        sponsorBlock = null;
    }
    if (videoPosition) {
        var videoProgress = getSeconds(videoPosition)
    } else {
        var videoProgress = getVideoProgress(videoId).position;
    }
    var videoName = videoData.data.title;

    var videoTag = createVideoTag(videoData, videoProgress);

    var playlist = '';
    var videoPlaylists = videoData.data.playlist; // Array of playlists the video is in
    if (typeof(videoPlaylists) != 'undefined') {
        var subbedPlaylists = getSubbedPlaylists(videoPlaylists); // Array of playlist the video is in that are subscribed
        if (subbedPlaylists.length != 0) {
            var playlistData = getPlaylistData(subbedPlaylists[0]); // Playlist data for first subscribed playlist
            var playlistId = playlistData.playlist_id;
            var playlistName = playlistData.playlist_name;
            var playlist = `<h5><a href="/playlist/${playlistId}/">${playlistName}</a></h5>`;
        }
    }

    var videoViews = formatNumbers(videoData.data.stats.view_count);

    var channelId = videoData.data.channel.channel_id;
    var channelName = videoData.data.channel.channel_name;

    removePlayer();

    // If cast integration is enabled create cast button
    var castButton = '';
    if (videoData.config.application.enable_cast) {
        var castButton = `<google-cast-launcher id="castbutton"></google-cast-launcher>`;
    }

    // Watched indicator
    if (videoData.data.player.watched) {
        var watchStatusIndicator = createWatchStatusIndicator(videoId, "watched");
    } else {
        var watchStatusIndicator = createWatchStatusIndicator(videoId, "unwatched");
    }


    var playerStats = `<div class="thumb-icon player-stats"><img src="/static/img/icon-eye.svg" alt="views icon"><span>${videoViews}</span>`;
    if (videoData.data.stats.like_count) {
        var likes = formatNumbers(videoData.data.stats.like_count);
        playerStats += `<span>|</span><img src="/static/img/icon-thumb.svg" alt="thumbs-up"><span>${likes}</span>`;
    }
    if (videoData.data.stats.dislike_count && videoData.config.downloads.integrate_ryd) {
        var dislikes = formatNumbers(videoData.data.stats.dislike_count);
        playerStats += `<span>|</span><img class="dislike" src="/static/img/icon-thumb.svg" alt="thumbs-down"><span>${dislikes}</span>`;
    }
    playerStats += "</div>";

    const markup = `
    <div class="video-player" data-id="${videoId}">
        <div class="video-modal"><span class="video-modal-text"></span></div>
        ${videoTag}
        <div class="notifications" id="notifications"></div>
        ${sponsorBlockElements}
        <div class="player-title boxed-content">
            <img class="close-button" src="/static/img/icon-close.svg" alt="close-icon" data="${videoId}" onclick="removePlayer()" title="Close player">
            ${watchStatusIndicator}
            ${castButton}
            ${playerStats}
            <div class="player-channel-playlist">
                <h3><a href="/channel/${channelId}/">${channelName}</a></h3>
                ${playlist}
            </div>
            <a href="/video/${videoId}/"><h2 id="video-title">${videoName}</h2></a>
        </div>
    </div>
    `;
    const divPlayer = document.getElementById("player");
    divPlayer.innerHTML = markup;
    recordTextTrackChanges();
}

// Add video tag to video page when passed a video id, function loaded on page load `video.html (115-117)`
function insertVideoTag(videoData, videoProgress) {
    var videoTag = createVideoTag(videoData, videoProgress);
    var videoMain = document.querySelector(".video-main");
    videoMain.innerHTML += videoTag;
}

// Generates a video tag with subtitles when passed videoData and videoProgress.
function createVideoTag(videoData, videoProgress) {
    var videoId = videoData.data.youtube_id;
    var videoUrl = videoData.data.media_url;
    var videoThumbUrl = videoData.data.vid_thumb_url;
    var subtitles = '';
    var videoSubtitles = videoData.data.subtitles; // Array of subtitles
    if (typeof(videoSubtitles) != 'undefined' && videoData.config.downloads.subtitle) {
        for (var i = 0; i < videoSubtitles.length; i++) {
            let label = videoSubtitles[i].name;
            if (videoSubtitles[i].source == "auto") {
                label += " - auto";
            }
            subtitles += `<track label="${label}" kind="subtitles" srclang="${videoSubtitles[i].lang}" src="${videoSubtitles[i].media_url}">`;
        }
    }

    var videoTag = `
    <video poster="${videoThumbUrl}" ontimeupdate="onVideoProgress()" onpause="onVideoPause()" onended="onVideoEnded()" controls autoplay width="100%" playsinline id="video-item">
        <source src="${videoUrl}#t=${videoProgress}" type="video/mp4" id="video-source" videoid="${videoId}">
        ${subtitles}
    </video>
    `;
    return videoTag;
}

// Gets video tag
function getVideoPlayer() {
    var videoElement = document.getElementById("video-item");
    return videoElement;
}

// Gets the video source tag
function getVideoPlayerVideoSource() {
    var videoPlayerVideoSource = document.getElementById("video-source");
    return videoPlayerVideoSource;
}

// Gets the current progress of the video currently in the player
function getVideoPlayerCurrentTime() {
    var videoElement = getVideoPlayer();
    if (videoElement != null) {
        return videoElement.currentTime;
    }
}

// Gets the video id of the video currently in the player
function getVideoPlayerVideoId() {
    var videoPlayerVideoSource = getVideoPlayerVideoSource();
    if (videoPlayerVideoSource != null) {
        return videoPlayerVideoSource.getAttribute("videoid");
    }
}

// Gets the duration of the video currently in the player
function getVideoPlayerDuration() {
    var videoElement = getVideoPlayer();
    if (videoElement != null) {
        return videoElement.duration;
    }
}

// Gets current watch status of video based on watch button
function getVideoPlayerWatchStatus() {
    var videoId = getVideoPlayerVideoId();
    var watched = false;

    var watchButtons = document.getElementsByClassName("watch-button");
    for (let i = 0; i < watchButtons.length; i++) {
        if (watchButtons[i].getAttribute("data-id") == videoId && watchButtons[i].getAttribute("data-status") == "watched") {
            watched = true;
        }
    }
    return watched;
}

// Runs on video playback, marks video as watched if video gets to 90% or higher, sends position to api, SB skipping
function onVideoProgress() {
    var videoId = getVideoPlayerVideoId();
    var currentTime = getVideoPlayerCurrentTime();
    var duration = getVideoPlayerDuration();
    var videoElement = getVideoPlayer();
    var notificationsElement = document.getElementById("notifications");
    if (sponsorBlock && sponsorBlock.segments) {
        for(let i in sponsorBlock.segments) {
            if(currentTime >= sponsorBlock.segments[i].segment[0] && currentTime <= sponsorBlock.segments[i].segment[0] + 0.3) {
                videoElement.currentTime = sponsorBlock.segments[i].segment[1];
                var notificationElement = document.getElementById("notification-" + sponsorBlock.segments[i].UUID);
                if (!notificationElement) {
                    notificationsElement.innerHTML += `<h3 id="notification-${sponsorBlock.segments[i].UUID}">Skipped sponsor segment from ${formatTime(sponsorBlock.segments[i].segment[0])} to ${formatTime(sponsorBlock.segments[i].segment[1])}.</h3>`;
                }
            }
            if(currentTime > sponsorBlock.segments[i].segment[1] + 10) {
                var notificationsElementUUID = document.getElementById("notification-" + sponsorBlock.segments[i].UUID);
                if(notificationsElementUUID) {
                    notificationsElementUUID.outerHTML = '';
                }
            }
        }
    }
    if ((currentTime % 10).toFixed(1) <= 0.2) { // Check progress every 10 seconds or else progress is checked a few times a second
        postVideoProgress(videoId, currentTime);
        if (!getVideoPlayerWatchStatus()) { // Check if video is already marked as watched
            if (watchedThreshold(currentTime, duration)) {
                updateVideoWatchStatus(videoId, "unwatched");
            }
        }
    }
}

// Runs on video end, marks video as watched
function onVideoEnded() {
    var videoId = getVideoPlayerVideoId();
    if (!getVideoPlayerWatchStatus()) { // Check if video is already marked as watched
        updateVideoWatchStatus(videoId, "unwatched");
    }
    for(let i in sponsorBlock.segments) {
        var notificationsElementUUID = document.getElementById("notification-" + sponsorBlock.segments[i].UUID);
        if(notificationsElementUUID) {
            notificationsElementUUID.outerHTML = '';
        }
    }
}

function watchedThreshold(currentTime, duration) {
    var watched = false;
    if (duration <= 1800){ // If video is less than 30 min
        if ((currentTime / duration) >= 0.90) { // Mark as watched at 90%
            var watched = true;
        }
    } else { // If video is more than 30 min
        if (currentTime >= (duration - 120)) { // Mark as watched if there is two minutes left
            var watched = true;
        }
    }
    return watched;
}

// Runs on video pause. Sends current position.
function onVideoPause() {
    var videoId = getVideoPlayerVideoId();
    var currentTime = getVideoPlayerCurrentTime();
    postVideoProgress(videoId, currentTime);
}

// Format numbers for frontend
function formatNumbers(number) {
    var numberUnformatted = parseFloat(number);
    if (numberUnformatted > 999999999) {
        var numberFormatted = (numberUnformatted / 1000000000).toFixed(1).toString() + "B";
    } else if (numberUnformatted > 999999) {
        var numberFormatted = (numberUnformatted / 1000000).toFixed(1).toString() + "M";
    } else if (numberUnformatted > 999) {
        var numberFormatted = (numberUnformatted / 1000).toFixed(1).toString() + "K";
    } else {
        var numberFormatted = numberUnformatted;
    }
    return numberFormatted;
}

// Formats times in seconds for frontend
function formatTime(time) {
    var hoursUnformatted = time / 3600;
    var minutesUnformatted  = (time % 3600) / 60;
    var secondsUnformatted  = time % 60;

    var hoursFormatted = Math.trunc(hoursUnformatted);
    if(minutesUnformatted < 10 && hoursFormatted > 0) {
        var minutesFormatted  = "0" + Math.trunc(minutesUnformatted);
    } else {
        var minutesFormatted = Math.trunc(minutesUnformatted);
    }
    if(secondsUnformatted < 10) {
        var secondsFormatted = "0" + Math.trunc(secondsUnformatted);
    } else {
        var secondsFormatted = Math.trunc(secondsUnformatted);
    }

    var timeUnformatted = '';
    if(hoursFormatted > 0) {
        timeUnformatted = hoursFormatted + ":"
    }
    var timeFormatted = timeUnformatted.concat(minutesFormatted, ":", secondsFormatted);
    return timeFormatted;
}

// Gets video data when passed video ID
function getVideoData(videoId) {
    var apiEndpoint = "/api/video/" + videoId + "/";
    var videoData = apiRequest(apiEndpoint, "GET");
    return videoData;
}

// Gets channel data when passed channel ID
function getChannelData(channelId) {
    var apiEndpoint = "/api/channel/" + channelId + "/";
    var channelData = apiRequest(apiEndpoint, "GET");
    return channelData.data;
}

// Gets playlist data when passed playlist ID
function getPlaylistData(playlistId) {
    var apiEndpoint = "/api/playlist/" + playlistId + "/";
    var playlistData = apiRequest(apiEndpoint, "GET");
    return playlistData.data;
}

// Get video progress data when passed video ID
function getVideoProgress(videoId) {
    var apiEndpoint = "/api/video/" + videoId + "/progress/";
    var videoProgress = apiRequest(apiEndpoint, "GET");
    return videoProgress;
}

// Given an array of playlist ids it returns an array of subbed playlist ids from that list
function getSubbedPlaylists(videoPlaylists) {
    var subbedPlaylists = [];
    for (var i = 0; i < videoPlaylists.length; i++) {
        if(getPlaylistData(videoPlaylists[i]).playlist_subscribed) {
            subbedPlaylists.push(videoPlaylists[i]);
        }
    }
    return subbedPlaylists;
}

// Send video position when given video id and progress in seconds
function postVideoProgress(videoId, videoProgress) {
    var apiEndpoint = "/api/video/" + videoId + "/progress/";
    var duartion = getVideoPlayerDuration();
    if (!isNaN(videoProgress) && duartion != 'undefined') {
        var data = {
            "position": videoProgress
        };
        if (videoProgress == 0) {
            apiRequest(apiEndpoint, "DELETE");
            // console.log("Deleting Video Progress for Video ID: " + videoId + ", Progress: " + videoProgress);
        } else if (!getVideoPlayerWatchStatus()) {
            apiRequest(apiEndpoint, "POST", data);
            // console.log("Saving Video Progress for Video ID: " + videoId + ", Progress: " + videoProgress);
        }
    }
}

// Send sponsor segment when given video id and and timestamps
function postSponsorSegment(videoId, startTime, endTime) {
    var apiEndpoint = "/api/video/" + videoId + "/sponsor/";
    var data = {
        "segment": {
            "startTime": startTime,
            "endTime": endTime
        }
    };
    apiRequest(apiEndpoint, "POST", data);
}

// Send sponsor segment when given video id and and timestamps
function postSponsorSegmentVote(videoId, uuid, vote) {
    var apiEndpoint = "/api/video/" + videoId + "/sponsor/";
    var data = {
        "vote": {
            "uuid": uuid,
            "yourVote": vote
        }
    };
    apiRequest(apiEndpoint, "POST", data);
}

function handleCookieValidate() {
    document.getElementById("cookieButton").remove();
    var cookieMessageElement = document.getElementById("cookieMessage");
    cookieMessageElement.innerHTML = `<span>Processing.</span>`;
    response = postCookieValidate();
    if (response.cookie_validated == true) {
        cookieMessageElement.innerHTML = `<span>The cookie file is valid.</span>`;
    } else {
        cookieMessageElement.innerHTML = `<span class="danger-zone">Warning, the cookie file is invalid.</span>`;
    }
}

// Check youtube cookie settings
function postCookieValidate() {
    var apiEndpoint = "/api/cookie/";
    return apiRequest(apiEndpoint, "POST");
}

// Makes api requests when passed an endpoint and method ("GET", "POST", "DELETE")
function apiRequest(apiEndpoint, method, data) {
    const xhttp = new XMLHttpRequest();
    var sessionToken = getCookie("sessionid");
    xhttp.open(method, apiEndpoint, false);
    xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken")); // Used for video progress POST requests
    xhttp.setRequestHeader("Authorization", "Token " + sessionToken);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(data));
    return JSON.parse(xhttp.responseText);
}

// Gets origin URL
function getURL() {
    return window.location.origin;
}

function removePlayer() {
    var currentTime = getVideoPlayerCurrentTime();
    var duration = getVideoPlayerDuration();
    var videoId = getVideoPlayerVideoId();
    postVideoProgress(videoId, currentTime);
    setProgressBar(videoId, currentTime, duration);
    var playerElement = document.getElementById('player');
    if (playerElement.hasChildNodes()) {
        var youtubeId = playerElement.childNodes[1].getAttribute("data-id");
        var playedStatus = document.createDocumentFragment();
        var playedBox = document.getElementById(youtubeId);
        if (playedBox) {
            playedStatus.appendChild(playedBox);
        }
        playerElement.innerHTML = '';
        // append played status
        var videoInfo = document.getElementById('video-info-' + youtubeId);
        if (videoInfo) {
            videoInfo.insertBefore(playedStatus, videoInfo.firstChild);
        }
    }
}

// Sets the progress bar when passed a video id, video progress and video duration
function setProgressBar(videoId, currentTime, duration) {
    var progressBarWidth = (currentTime / duration) * 100 + "%";
    var progressBars = document.getElementsByClassName("video-progress-bar");
    for (let i = 0; i < progressBars.length; i++) {
        if (progressBars[i].id == "progress-" + videoId) {
            if (!getVideoPlayerWatchStatus()) {
                progressBars[i].style.width = progressBarWidth;
            } else {
                progressBars[i].style.width = "0%";
            }
        }
    }

    // progressBar = document.getElementById("progress-" + videoId);


}

// multi search form
let searchTimeout = null;
function searchMulti(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
        if (query.length > 1) {
            var http = new XMLHttpRequest();
            http.onreadystatechange = function() {
                if (http.readyState === 4) {
                    response = JSON.parse(http.response);
                    populateMultiSearchResults(response.results, response.queryType);
                }
            };
            http.open("GET", `/api/search/?query=${query}`, true);
            http.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
            http.setRequestHeader("Content-type", "application/json");
            http.send();
        }
    }, 500);
}

function getViewDefaults(view) {
    var defaultView = document.getElementById("id_" + view).value;
    return defaultView;
}

function populateMultiSearchResults(allResults, queryType) {
    // videos
    var defaultVideo = getViewDefaults("home");
    var allVideos = allResults.video_results;
    var videoBox = document.getElementById("video-results");
    videoBox.innerHTML = "";
    videoBox.parentElement.style.display = "block";
    if (allVideos.length > 0) {
        for (let index = 0; index < allVideos.length; index++) {
            const video = allVideos[index].source;
            const videoDiv = createVideo(video, defaultVideo);
            videoBox.appendChild(videoDiv);
        }
    } else {
        if (queryType === "simple" || queryType == "video") {
            videoBox.innerHTML = "<p>No videos found.</p>";
        } else {
            videoBox.parentElement.style.display = "none";
        }
    }
    // channels
    var defaultChannel = getViewDefaults("channel");
    var allChannels = allResults.channel_results;
    var channelBox = document.getElementById("channel-results");
    channelBox.innerHTML = "";
    channelBox.parentElement.style.display = "block";
    if (allChannels.length > 0) {
        for (let index = 0; index < allChannels.length; index++) {
            const channel = allChannels[index].source;
            const channelDiv = createChannel(channel, defaultChannel);
            channelBox.appendChild(channelDiv);
        }
    } else {
        if (queryType === "simple" || queryType == "channel") {
            channelBox.innerHTML = "<p>No channels found.</p>";
        } else {
            channelBox.parentElement.style.display = "none";
        }
    }
    // playlists
    var defaultPlaylist = getViewDefaults("playlist");
    var allPlaylists = allResults.playlist_results;
    var playlistBox = document.getElementById("playlist-results");
    playlistBox.innerHTML = "";
    playlistBox.parentElement.style.display = "block";
    if (allPlaylists.length > 0) {
        for (let index = 0; index < allPlaylists.length; index++) {
            const playlist = allPlaylists[index].source;
            const playlistDiv = createPlaylist(playlist, defaultPlaylist);
            playlistBox.appendChild(playlistDiv);
        }
    } else {
        if (queryType === "simple" || queryType == "playlist") {
            playlistBox.innerHTML = "<p>No playlists found.</p>";
        } else {
            playlistBox.parentElement.style.display = "none";
        }
    }
    // fulltext
    var allFullText = allResults.fulltext_results;
    var fullTextBox = document.getElementById("fulltext-results");
    fullTextBox.innerHTML = "";
    fullTextBox.parentElement.style.display = "block";
    if (allFullText.length > 0) {
        for (let i = 0; i < allFullText.length; i++) {
            const fullText = allFullText[i];
            if ("highlight" in fullText) {
                const fullTextDiv = createFulltext(fullText);
                fullTextBox.appendChild(fullTextDiv);
            }
        }
    } else {
        if (queryType === "simple" || queryType == "full") {
            fullTextBox.innerHTML = "<p>No fulltext items found.</p>";
        } else {
            fullTextBox.parentElement.style.display = "none";
        }
    }
}


function createVideo(video, viewStyle) {
    // create video item div from template
    const videoId = video.youtube_id;
    const mediaUrl = video.media_url;
    const thumbUrl = "/cache/" + video.vid_thumb_url;
    const videoTitle = video.title;
    const videoPublished = video.published;
    const videoDuration = video.player.duration_str;
    if (video.player.watched) {
        var watchStatusIndicator = createWatchStatusIndicator(videoId, "watched");
    } else {
        var watchStatusIndicator = createWatchStatusIndicator(videoId, "unwatched");
    };
    const channelId = video.channel.channel_id;
    const channelName = video.channel.channel_name;
    // build markup
    const markup = `
    <a href="#player" data-id="${videoId}" onclick="createPlayer(this)">
        <div class="video-thumb-wrap ${viewStyle}">
            <div class="video-thumb">
                <img src="${thumbUrl}" alt="video-thumb">
            </div>
            <div class="video-play">
                <img src="/static/img/icon-play.svg" alt="play-icon">
            </div>
        </div>
    </a>
    <div class="video-desc ${viewStyle}">
        <div class="video-desc-player" id="video-info-${videoId}">
                ${watchStatusIndicator}
            <span>${videoPublished} | ${videoDuration}</span>
        </div>
        <div>
            <a href="/channel/${channelId}/"><h3>${channelName}</h3></a>
            <a class="video-more" href="/video/${videoId}/"><h2>${videoTitle}</h2></a>
        </div>
    </div>
    `;
    const videoDiv = document.createElement("div");
    videoDiv.setAttribute("class", "video-item " + viewStyle);
    videoDiv.innerHTML = markup;
    return videoDiv;
}


function createChannel(channel, viewStyle) {
    // create channel item div from template
    const channelId = channel.channel_id;
    const channelName = channel.channel_name;
    const channelSubs = channel.channel_subs;
    const channelLastRefresh = channel.channel_last_refresh;
    if (channel.channel_subscribed) {
        var button = `<button class="unsubscribe" type="button" id="${channelId}" onclick="unsubscribe(this.id)" title="Unsubscribe from ${channelName}">Unsubscribe</button>`;
    } else {
        var button = `<button type="button" id="${channelId}" onclick="subscribe(this.id)" title="Subscribe to ${channelName}">Subscribe</button>`;
    }
    // build markup
    const markup = `
    <div class="channel-banner ${viewStyle}">
        <a href="/channel/${channelId}/">
            <img src="/cache/channels/${channelId}_banner.jpg" alt="${channelId}-banner">
        </a>
    </div>
    <div class="info-box info-box-2 ${viewStyle}">
        <div class="info-box-item">
            <div class="round-img">
                <a href="/channel/${channelId}/">
                    <img src="/cache/channels/${channelId}_thumb.jpg" alt="channel-thumb">
                </a>
            </div>
            <div>
                <h3><a href="/channel/${channelId}/">${channelName}</a></h3>
                <p>Subscribers: ${channelSubs}</p>
            </div>
        </div>
        <div class="info-box-item">
            <div>
                <p>Last refreshed: ${channelLastRefresh}</p>
                ${button}
            </div>
        </div>
    </div>
    `;
    const channelDiv = document.createElement("div");
    channelDiv.setAttribute("class", "channel-item " + viewStyle);
    channelDiv.innerHTML = markup;
    return channelDiv;
}

function createPlaylist(playlist, viewStyle) {
    // create playlist item div from template
    const playlistId = playlist.playlist_id;
    const playlistName = playlist.playlist_name;
    const playlistChannelId = playlist.playlist_channel_id;
    const playlistChannel = playlist.playlist_channel;
    const playlistLastRefresh = playlist.playlist_last_refresh;
    if (playlist.playlist_subscribed) {
        var button = `<button class="unsubscribe" type="button" id="${playlistId}" onclick="unsubscribe(this.id)" title="Unsubscribe from ${playlistName}">Unsubscribe</button>`;
    } else {
        var button = `<button type="button" id="${playlistId}" onclick="subscribe(this.id)" title="Subscribe to ${playlistName}">Subscribe</button>`;
    }
    const markup = `
    <div class="playlist-thumbnail">
        <a href="/playlist/${playlistId}/">
            <img src="/cache/playlists/${playlistId}.jpg" alt="${playlistId}-thumbnail">
        </a>
    </div>
    <div class="playlist-desc ${viewStyle}">
        <a href="/channel/${playlistChannelId}/"><h3>${playlistChannel}</h3></a>
        <a href="/playlist/${playlistId}/"><h2>${playlistName}</h2></a>
        <p>Last refreshed: ${playlistLastRefresh}</p>
        ${button}
    </div>
    `;
    const playlistDiv = document.createElement("div");
    playlistDiv.setAttribute("class", "playlist-item " + viewStyle);
    playlistDiv.innerHTML = markup;
    return playlistDiv;
}

function createFulltext(fullText) {
    const videoId = fullText.source.youtube_id;
    const videoTitle = fullText.source.title;
    const thumbUrl = fullText.source.vid_thumb_url;
    const channelId = fullText.source.subtitle_channel_id;
    const channelName = fullText.source.subtitle_channel;
    const subtitleLine = fullText.highlight.subtitle_line[0];
    const subtitle_start = fullText.source.subtitle_start.split(".")[0];
    const subtitle_end = fullText.source.subtitle_end.split(".")[0];
    const markup = `
    <a href="#player" data-id="${videoId}" data-position="${subtitle_start}" onclick="createPlayer(this)">
        <div class="video-thumb-wrap list">
            <div class="video-thumb">
                <img src="${thumbUrl}" alt="video-thumb">
            </div>
            <div class="video-play">
                <img src="/static/img/icon-play.svg" alt="play-icon">
            </div>
        </div>
    </a>
    <div class="video-desc list">
        <p>${subtitle_start} - ${subtitle_end}</p>
        <p>${subtitleLine}</p>
        <div>
            <a href="/channel/${channelId}/"><h3>${channelName}</h3></a>
            <a class="video-more" href="/video/${videoId}/?t=${subtitle_start}"><h2>${videoTitle}</h2></a>
        </div>
    </div>
    `
    const fullTextDiv = document.createElement("div");
    fullTextDiv.setAttribute("class", "video-item list");
    fullTextDiv.innerHTML = markup;
    return fullTextDiv
}

// generic

function sendPost(payload) {
    var http = new XMLHttpRequest();
    http.open("POST", "/process/", true);
    http.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    http.setRequestHeader("Content-type", "application/json");
    http.send(payload);
}


function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
}


// animations

function textReveal() {
    var textBox = document.getElementById("text-reveal");
    var button = document.getElementById("text-reveal-button");
    var textBoxHeight = textBox.style.height;
    if (textBoxHeight === "unset") {
        textBox.style.height = "0px";
        button.innerText = "Show";
    } else {
        textBox.style.height = "unset";
        button.innerText = "Hide";
    }
}

function textExpand() {
    var textBox = document.getElementById("text-expand");
    var button = document.getElementById("text-expand-button");
    var style = window.getComputedStyle(textBox)
    if (style.webkitLineClamp === "none") {
        textBox.style["-webkit-line-clamp"] = "4";
        button.innerText = "Show more";
    } else {
        textBox.style["-webkit-line-clamp"] = "unset";
        button.innerText = "Show less";
    }
}

// hide "show more" button if all text is already visible
function textExpandButtonVisibilityUpdate() {
    var textBox = document.getElementById("text-expand");
    var button = document.getElementById("text-expand-button");
    if (!textBox || !button)
        return;

    var styles = window.getComputedStyle(textBox);
    var textBoxLineClamp = styles.webkitLineClamp;
    if (textBoxLineClamp === "unset")
        return; // text box is in revealed state

    if (textBox.offsetHeight < textBox.scrollHeight
        || textBox.offsetWidth < textBox.scrollWidth) {
        // the element has an overflow, show read more button
        button.style.display = "inline-block";
    } else {
        // the element doesn't have overflow
        button.style.display = "none";
    }
}

document.addEventListener("readystatechange", textExpandButtonVisibilityUpdate);
window.addEventListener("resize", textExpandButtonVisibilityUpdate);

function showForm() {
    var formElement = document.getElementById('hidden-form');
    var displayStyle = formElement.style.display;
    if (displayStyle === "") {
        formElement.style.display = 'block';
    } else {
        formElement.style.display = "";
    }
    animate('animate-icon', 'pulse-img');
}

function channelFilterDownload(value) {
    if (value === "all") {
        window.location = "/downloads/";
    } else {
        window.location.search = "?channel=" + value;
    }
}

function showOverwrite() {
    var overwriteDiv = document.getElementById("overwrite-form");
    if (overwriteDiv.classList.contains("hidden-overwrite")) {
        overwriteDiv.classList.remove("hidden-overwrite");
    } else {
        overwriteDiv.classList.add("hidden-overwrite")
    }
}

function animate(elementId, animationClass) {
    var toAnimate = document.getElementById(elementId);
    if (toAnimate.className !== animationClass) {
        toAnimate.className = animationClass;
    } else {
        toAnimate.classList.remove(animationClass);
    }
}

// keep track of changes to the subtitles list made with the native UI
// needed so that when toggling subtitles with the shortcut we go to the last selected one, not the first one
addEventListener('DOMContentLoaded', recordTextTrackChanges);

let lastSeenTextTrack = 0;
function recordTextTrackChanges() {
    let player = getVideoPlayer();
    if (player == null) {
        return;
    }
    player.textTracks.addEventListener('change', () => {
        let active = [...player.textTracks].findIndex(x => x.mode === 'showing');
        if (active !== -1) {
            lastSeenTextTrack = active;
        }
    });
}

// keyboard shortcuts for the video player
document.addEventListener('keydown', doShortcut);

let modalHideTimeout = -1;
function showModal(html, duration) {
    let player = getVideoPlayer();
    let modal = document.querySelector('.video-modal-text');
    modal.innerHTML = html;
    modal.style.display = 'initial';
    clearTimeout(modalHideTimeout);
    modalHideTimeout = setTimeout(() => { modal.style.display = 'none'; }, duration);
}

let videoSpeeds = [.25, .5, .75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
function doShortcut(e) {
    if (!(e.target instanceof HTMLElement)) {
        return;
    }
    let target = e.target;
    let targetName = target.nodeName.toLowerCase();
    if (targetName === 'textarea' || targetName === 'input' || targetName === 'select' || target.isContentEditable) {
        return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
    }
    let player = getVideoPlayer();
    if (player == null) {
        // not on the video page
        return;
    }
    switch (e.key) {
        case 'c': {
            // toggle captions
            let tracks = [...player.textTracks];
            if (tracks.length === 0) {
                break;
            }
            let active = tracks.find(x => x.mode === 'showing');
            if (active != null) {
                active.mode = 'disabled';
            } else {
                tracks[lastSeenTextTrack].mode = 'showing';
            }
            break;
        }
        case 'm': {
            player.muted = !player.muted;
            break;
        }
        case 'ArrowLeft': {
            if (targetName === 'video') {
                // hitting arrows while the video is focused will use the built-in skip
                break;
            }
            showModal('- 5 seconds', 500);
            player.currentTime -= 5;
            break;
        }
        case 'ArrowRight': {
            if (targetName === 'video') {
                // hitting space while the video is focused will use the built-in skip
                break;
            }
            showModal('+ 5 seconds', 500);
            player.currentTime += 5;
            break;
        }
        case '<':
        case '>': {
            // change speed
            let currentSpeedIdx = videoSpeeds.findIndex(s => s >= player.playbackRate);
            if (currentSpeedIdx === -1) {
                // handle the case where the user manually set the speed above our max speed
                currentSpeedIdx = videoSpeeds.length - 1;
            }
            let newSpeedIdx = e.key === '<' ? Math.max(0, currentSpeedIdx - 1) : Math.min(videoSpeeds.length - 1, currentSpeedIdx + 1);
            let newSpeed = videoSpeeds[newSpeedIdx];
            player.playbackRate = newSpeed;
            showModal(newSpeed + 'x', 500);
            break;
        }
        case ' ': {
            if (targetName === 'video') {
                // hitting space while the video is focused will toggle it anyway
                break;
            }
            e.preventDefault();
            if (player.paused) {
                player.play();
            } else {
                player.pause();
            }
            break;
        }
        case '?': {
            showModal(`
                <table style="margin: auto; background: rgba(0,0,0,.5)"><tbody>
                <tr><td>Show help</td><td>?</td>
                <tr><td>Toggle mute</td><td>m</td>
                <tr><td>Toggle subtitles (if available)</td><td>c</td>
                <tr><td>Increase speed</td><td>&gt;</td>
                <tr><td>Decrease speed</td><td>&lt;</td>
                <tr><td>Back 5 seconds</td><td>←</td>
                <tr><td>Forward 5 seconds</td><td>→</td>
            `, 3000);
            break;
        }
    }
}

