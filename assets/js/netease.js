API2 = "https://netease.api.3r60.top"

// 搜索
function searchMusic(keyword) {
    const apiUrl = API2 + `/search?keywords=${encodeURIComponent(keyword)}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayResults(data, keyword);
        });
}

var search_lists = [];

function displayResults(data, keyword) {
    const searchResults = document.getElementById('searchResults');
    if (data.result && data.result.songs.length > 0) {
        search_lists = data.result.songs;
        let resultsHtml = `<h2>"${keyword}"的搜索结果</h2>`;
        resultsHtml += `<div class="playlist-actions" style="margin-bottom: 12px;margin-top:12px">
                    <button class="btn btn-success btn-shadow btn-md" 
                            onclick="replacePlaylistWithCurrent()">
                        <i class="bi bi-play-fill"></i> 全部播放
                    </button>
                    <button class="btn btn-white btn-shadow btn-md" 
                            onclick="addAllToPlaylist()">
                        <i class="bi bi-plus-square"></i> 添加到列表
                    </button>
                </div>`;
        resultsHtml += `<table id="musicLists" class='result'><tr><th>歌曲名称</th><th>艺术家</th><th>专辑</th></tr>`;
        data.result.songs.forEach(song => {
            const songInfo = JSON.stringify({
                id: song.id,
                name: song.name,
                artists: formatArtistNames(song.artists),
                picUrl: song.picUrl
            });
            resultsHtml += `<tr id="music_${song.id}" ${song.id === playlist[currentTrackIndex].id ? 'class="active"' : '"'}>`;
            resultsHtml += `<td><a href='JavaScript:requestMusicChange(${song.id})' data-song-info='${songInfo}' >${song.name}</a></td>`;
            resultsHtml += `<td><a href='JavaScript:requestMusicChange(${song.id})' data-song-info='${songInfo}' >${formatArtistNames(song.artists)}</a></td>`;
            resultsHtml += `<td><a href='JavaScript:requestMusicChange(${song.id})' data-song-info='${songInfo}' >${song.album.name}</a></td>`;
            resultsHtml += `</tr>`;
        });
        resultsHtml += `</table>`;
        searchResults.innerHTML = resultsHtml;
    } else {
        searchResults.innerHTML = `<p>未找到与 "${keyword}" 相关的结果。</p>`;
    }
    bindMenu();

}
// 搜索MV
function searchMovie(keyword) {
    const apiUrl = API2 + `/search?type=1004&keywords=${encodeURIComponent(keyword)}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayResults_movie(data, keyword);
        });
}

function displayResults_movie(data, keyword) {
    const searchResults = document.getElementById('searchResults');
    if (data.result && data.result.mvs.length > 0) {
        let resultsHtml = `<h2>"${keyword}"的MV搜索结果</h2>`;
        resultsHtml += `<table class='result'><tr><th>视频名称</th><th>艺术家</th><th>播放量</th></tr>`;
        data.result.mvs.forEach(mv => {
            resultsHtml += `<tr>`;
            resultsHtml += `<td><a href='JavaScript:requestMovieChange(${mv.id})' >${mv.name}</a></td>`;
            resultsHtml += `<td><a href='JavaScript:requestMovieChange(${mv.id})' >${mv.artistName}</a></td>`;
            resultsHtml += `<td><a href='JavaScript:requestMovieChange(${mv.id})' >${mv.playCount}</a></td>`;
            resultsHtml += `</tr>`;
        });
        resultsHtml += `</table>`;
        searchResults.innerHTML = resultsHtml;
    } else {
        searchResults.innerHTML = `<p>未找到与 "${keyword}" 相关的结果。</p>`;
    }
}
// 搜索歌单
function searchMusicList(keyword) {
    const apiUrl = API2 + `/search?keywords=${encodeURIComponent(keyword)}&type=1000`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayResults_list(data, keyword);
        });
}

function displayResults_list(data, keyword) {
    const searchResults = document.getElementById('searchResults');
    if (data.result && data.result.playlists.length > 0) {
        let resultsHtml = `<h2>"${keyword}"的歌单搜索结果</h2>`;
        resultsHtml += `<table class='result'><tr><th>歌单名称</th><th>创建者</th><th>播放量</th></tr>`;
        data.result.playlists.forEach(playlist => {
            resultsHtml += `<tr>`;
            resultsHtml += `<td><a href='javascript:loadUrl("songListInfo.html?songlistId=${playlist.id}")' class="hostLink">${playlist.name}</a></td>`;
            resultsHtml += `<td><a href='javascript:loadUrl("songListInfo.html?songlistId=${playlist.id}")' class="hostLink">${playlist.creator.nickname}</a></td>`;
            resultsHtml += `<td><a href='javascript:loadUrl("songListInfo.html?songlistId=${playlist.id}")' class="hostLink">${playlist.playCount}</a></td>`;
            resultsHtml += `</tr>`;
        });
        resultsHtml += `</table>`;
        searchResults.innerHTML = resultsHtml;
    } else {
        searchResults.innerHTML = `<p>未找到与 "${keyword}" 相关的结果。</p>`;
    }
}
// 首页
function getSongList() {
    const apiUrl = API2 + `/personalized?limit=15`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayResults_songList(data);
        });
}

function displayResults_songList(data) {
    const searchResults = document.getElementById('Results');
    if (data && data.result.length > 0) {
        let resultsHtml = "";
        resultsHtml += `<h2>歌单推荐</h2>`;
        resultsHtml += `<div class="hiddenOver" style="height: 210px;overflow-x: auto;overflow-y: hidden;display: flex;">`;
        data.result.forEach(songList => {
            resultsHtml += `
            <a href="javascript:loadUrl('songListInfo.html?songlistId=${songList.id}')" class="hostLink">
                <button style="padding:0;width:150px;height:190px" class="btn btn-white btn-shadow btn-lg mr-5" type="submit">
                    <img style="width:100%;height:auto;border-radius:5px" alt="封面" src="${songList.picUrl}" height="35px"/>
                    <br>
                    <span style='height: 45px;display: block;overflow: hidden;'>${songList.name}
                    </span>
                </button>
            </a>`;
        });
        resultsHtml += `</div>`
        searchResults.innerHTML = resultsHtml;
    } else {
        searchResults.innerHTML = `获取失败`;
    }
}
function getTop() {
    const apiUrl = API2 + `/toplist/detail`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayResults_top(data);
        });
}

function displayResults_top(data) {
    const searchResults = document.getElementById('TopResults');
    if (data && data.list.length > 0) {
        let resultsHtml = "";
        resultsHtml += `<h2>排行榜</h2>`;
        resultsHtml += `<div class="hiddenOver" style="height: 190px;overflow-x: auto;overflow-y: hidden;display: flex;">`;
        data.list.forEach(songList => {
            resultsHtml += `
            <a href="javascript:loadUrl('songListInfo.html?songlistId=${songList.id}')" class="hostLink">
                <button style="padding:0;width:150px;height:170px" class="btn btn-white btn-shadow btn-lg mr-5" type="submit">
                    <img style="width:100%;height:auto;border-radius:5px" alt="封面" src="${songList.coverImgUrl}" height="35px"/>
                    <br>
                    <span style='height: 45px;display: block;overflow: hidden;'>${songList.name}
                    </span>
                </button>
            </a>`;
        });
        resultsHtml += `</div>`
        searchResults.innerHTML = resultsHtml;
    } else {
        searchResults.innerHTML = `获取失败`;
    }
}
function getMusic() {
    const apiUrl = API2 + `/personalized/newsong`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayResults_music(data);
        });
}

function displayResults_music(data) {
    const searchResults = document.getElementById('MusicResults');
    if (data && data.result.length > 0) {
        let resultsHtml = "";
        resultsHtml += `<h2>新歌速递</h2>`;
        resultsHtml += `<div class="hiddenOver" style="height: 200px;overflow-x: auto;overflow-y: hidden;display: flex;">`;
        data.result.forEach(song => {
            resultsHtml += `
            <a href="JavaScript:requestMusicChange(${song.id})">
                <button style="padding:0;width:150px;height:180px" class="btn btn-white btn-shadow btn-lg mr-5" type="submit">
                    <img style="width:100%;height:auto;border-radius:5px" alt="封面" src="${song.picUrl}?param=150y150" height="35px"/>
                    <br>
                    <span style='height: 45px;display: block;overflow: hidden;'>${song.name}
                    </span>
                </button>
            </a>`;
        });
        resultsHtml += `</div>`
        searchResults.innerHTML = resultsHtml;
    } else {
        searchResults.innerHTML = `获取失败`;
    }
}

let formatArtistNames = (artists) => {
    const names = artists.map(artist => artist.name);
    if (names.length > 5) {
        return names.slice(0, 5).join('/') + '/...';
    }
    return names.join('/');
}

