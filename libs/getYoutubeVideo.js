async function getVideoInformation(url) {
    if(!url)
        return 0;
    const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com|\.be)\/(?:watch\?v=)?(.+)/)[1];
    
    const { google } = require('googleapis');
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.API_KEY // Replace with your YouTube API key
    });
    
    const response =  await youtube.videos.list({
        part: 'snippet',
        id: videoId
    });
    
    const video = response.data.items[0];
    if(!video)
        return 0;
    const videoTitle = video.snippet.title;
    const videoDescription = video.snippet.description;
    const videoChannel = video.snippet.channelTitle;
    const defaultThumbnail = video.snippet.thumbnails.default.url;
    return {videoTitle,videoDescription,videoChannel,defaultThumbnail};
}

module.exports = {
    getVideoInformation
};