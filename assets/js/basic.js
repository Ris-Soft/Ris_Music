// RisMusic 核心脚本
// GNU General Public License v3.0 | © PYLXU(https://github.com/PYLXU) 保留所有权利

// 变常量定义
localVersion = "250307";
API = "";

var chosenMusic;
var currentLrcs = [];
let playModes = ['list-loop', 'single-loop', 'random'];
let currentPlayMode = 0; // 0:列表循环 1:单曲循环 2:随机播放
let playlist = [];
let currentTrackIndex = -1;
let turn = 0; // 歌词区域使用
let autoScrollEnabled = true;
let systemScroll = false;
let scrollTimeoutId;
const playMode_icons = {
    0: 'bi-arrow-repeat',
    1: 'bi-repeat-1',
    2: 'bi-shuffle'
};
const playMode_titles = {
    0: '列表循环',
    1: '单曲循环',
    2: '随机播放'
};
const menu = [
    {
        label: '立即播放',
        icon: 'bi-play-btn',
        onclick: () => {
            switchMusic(chosenMusic.id, "true");
        }
    },
    {
        label: '下一首播放',
        icon: 'bi-skip-forward',
        onclick: () => {
            playList.add(chosenMusic, false, true);
            createMessage("添加成功");
        }
    },
    {
        label: '下载',
        icon: 'bi-download',
        onclick: () => {
            window.open("https://api.3r60.top/v2/project/music/media.php?id=" + chosenMusic.id);
        }
    }
]; // 右键菜单项

function init() {

    // 获取组件地址
    musicPlayer = $('#MusicPlayer')[0];
    playPauseButton = $('#playPauseButton');
    progressBar = $('#SprogressBar')[0];
    currentTimeDisplay = $('#currentTime')[0];
    durationTimeDisplay = $('#durationTime')[0];
    muteButton = $('#muteButton');
    volumeBar = $('#volumeBar');

    // 绑定系统控件
    navigator.mediaSession.setActionHandler('play', () => { $('#MusicPlayer')[0].play() });
    navigator.mediaSession.setActionHandler('pause', () => { $('#MusicPlayer')[0].pause() });

    // 绑定iframe消息
    tools.handleWindowMessage();

    // 组件事件
    $('#shareButton').click(tools.handleShare);
    $('#miniCover').click(uiControl.playPage);
    $('#backButton').click(uiControl.playPage);

    // 播放控制
    $('#nextButton').click(mediaControl.next);
    $('#prevButton').click(mediaControl.previous);
    playPauseButton.click(mediaControl.playPause);
    musicPlayer.addEventListener('timeupdate', mediaControl.timeupdate);
    musicPlayer.addEventListener('loadeddata', mediaControl.initTime);
    musicPlayer.addEventListener('ended', mediaControl.handleEnded);
    progressBar.addEventListener('input', mediaControl.setTime);
    muteButton.click(mediaControl.mute);
    volumeBar.change(mediaControl.setVolume);

    // 绑定模式
    $('#playModeButton').click(playMode.toggle);

    // 歌词相关
    $('.lrc').on('scroll', lyrics.handleScroll);
    $('#ullrc').on('click', 'li', mediaControl.setTimeByLrc);

    // 快捷键
    $(document).on('keydown', uiControl.shortcut);

    // 深色模式适配
    $(document).on('colorModeChanged', uiControl.colorMode);
    uiControl.addStyle(getColorMode());

    // 处理分享参数
    uiControl.handleShareParams();

    // 播放模式/播放列表初始化
    playMode.init();
    playList.init();


}

const tools = {
    formatTime(seconds) {
        minutes = Math.floor(seconds / 60); secondsLeft = Math.floor(seconds % 60);
        return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    },
    queryReplace(key, keyValue) {
        let href = window.location.href;
        const urlParams = new URLSearchParams(href.split('?')[1] || '');
        if (urlParams.has(key)) {
            const currentValue = urlParams.get(key);
            if (currentValue !== keyValue) {
                urlParams.set(key, keyValue);
            }
        } else {
            urlParams.append(key, keyValue);
        }
        let newHref = href.split('?')[0] + '?' + urlParams.toString();
        window.history.replaceState({ path: newHref }, '', newHref);
    },
    handleWindowMessage() {
        window.addEventListener('message', function (event) {
            if (event.data.type === 'CHANGE_MUSIC') {
                switchMusic(event.data.id, "true");
            } else if (event.data.type === 'CHANGE_MOVIE') {
                fetch(`https://netease.api.3r60.top/mv/url?id=${event.data.id}`)
                    .then(response => response.json())
                    .then(data => {
                        window.open(data.data.url, "_blank");
                    });
            }
        }, false);
    },
    handleShare() {
        const url = musicPlayer.src;
        const fileName = $('#miniArtist').text() + " - " + $('#miniTitle').text();
        createDialog("alert", "success", "在新页面中继续操作", "格式化的歌曲名称已复制到剪辑板", () => {
            // 复制歌曲名称到剪贴板
            if (navigator.clipboard) {
                navigator.clipboard.writeText(fileName)
                    .then(() => {
                        console.log('歌曲名称已复制到剪贴板');
                    })
                    .catch(err => {
                        console.error('无法复制到剪贴板:', err);
                    });
            } else {
                console.warn('Clipboard API 不受支持，无法自动复制。');
            }
            window.open(url);
        });
    },
    formatArtistNames(artists) {
        const names = artists.map(artist => artist.name);
        if (names.length > 5) {
            return names.slice(0, 5).join('/') + '/...';
        }
        return names.join('/');
    }
} // 工具函数

const uiControl = {
    playPage(status = "auto") {
        const isAutoMode = typeof status !== "boolean" || status === "auto";
        const shouldExpand = isAutoMode
            ? $('.container').hasClass('hidden2')
            : status === true;

        if (shouldExpand) {
            $('.container')
                .removeClass('hidden2 container_close')
                .addClass('container_active');
        } else {
            $('.container')
                .removeClass('container_active')
                .addClass('container_close');
            setTimeout(() => {
                $('.container').addClass('hidden2');
            }, 190);
        }
    },
    playlist() {
        $('#playlistSidebar').toggleClass('active');
    },
    colorMode(event, mode) {
        uiControl.addStyle(mode === 'dark');
    },
    addStyle(isDark) {
        var styleContent = `
          .container::before {
            background-color: ${isDark ? 'rgba(0, 0, 0, 0.7);' : 'rgba(255, 255, 255, 0.7);'};
          }
          .container .lrc #ullrc li.active {
            color: ${isDark ? 'white' : 'black'};
          }
          .container .lrc #ullrc li:hover {
            color: ${isDark ? 'white' : 'black'};
          }
          .container .lrc #ullrc li {
            color: ${isDark ? 'rgba(255, 255, 255, .6)' : 'rgba(0, 0, 0, .6)'};
          }
          .MusicInfo{
            background-color: ${isDark ? 'rgb(20, 20, 20)' : 'rgb(235, 235, 235)'};
          }
        `;

        var styleElement = $('<style>').prop('type', 'text/css').html(styleContent);
        $('head').append(styleElement);
    },
    handleShareParams() {
        queryParams = new URLSearchParams(window.location.search);
        songId = queryParams.get('id');
        setInterval(() => { tools.queryReplace("id", songId) }, 10000);
        if (songId !== null) switchMusic(songId, queryParams.get('share'));
        if (queryParams.get('share') == "true") {
            $('.container').removeClass('hidden2');
            $('main').addClass('hidden');
        }
    },
    shortcut(event) {
        if (event.keyCode === 32) {
            var activeElement = document.activeElement;
            if (!(activeElement.tagName.toLowerCase() === 'input' || activeElement.tagName.toLowerCase() === 'textarea')) {
                if (musicPlayer.paused) {
                    musicPlayer.play();
                    playPauseButton.html('<i class="bi bi-pause-fill"></i>');
                } else {
                    musicPlayer.pause();
                    playPauseButton.html('<i class="bi bi-play-fill"></i>');
                }
            }
        }

    }
} // 界面操作函数

const mediaControl = {
    playPause(status) {
        if (musicPlayer.paused || status == true) {
            musicPlayer.play();
            playPauseButton.html('<i class="bi bi-pause-fill"></i>');
        } else {
            musicPlayer.pause();
            playPauseButton.html('<i class="bi bi-play-fill"></i>');
        }
    },
    next() {
        if (playlist.length === 0) return;
        let newIndex = currentTrackIndex;
        switch (currentPlayMode) {
            case 0: // 列表循环
                newIndex = (currentTrackIndex + 1) % playlist.length;
                break;
            case 1:
                newIndex = (currentTrackIndex + 1) % playlist.length;
                break;
            case 2: // 随机播放
                newIndex = Math.floor(Math.random() * playlist.length);
                while (newIndex === currentTrackIndex && playlist.length > 1) {
                    newIndex = Math.floor(Math.random() * playlist.length);
                }
                break;
            default:
                return;
        }

        currentTrackIndex = newIndex;
        switchMusic(playlist[currentTrackIndex].id, "true");
        playList.save();
    },
    previous() {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        switchMusic(playlist[currentTrackIndex].id, "true");
        playList.save();
    },
    initTime() {
        progressBar.max = musicPlayer.duration;
        durationTimeDisplay.textContent = tools.formatTime(musicPlayer.duration);
    },
    timeupdate() {
        progressBar.value = musicPlayer.currentTime;
        currentTimeDisplay.textContent = tools.formatTime(musicPlayer.currentTime);
        progressBar.style.background = 'linear-gradient(to right, var(--color-success), var(--color-success) ' + ($('#SprogressBar')[0].value / $('#SprogressBar')[0].max * 100) + '%,#ddd 0.1%)';
    },
    setTime() {
        musicPlayer.currentTime = progressBar.value;
    },
    setTimeByLrc() {
        const seconds = $(this).data('seconds');
        musicPlayer.currentTime = seconds;
    },
    mute() {
        musicPlayer.muted = !musicPlayer.muted;
        muteButton.html(musicPlayer.muted ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>');
    },
    setVolume() {
        musicPlayer.volume = volumeBar.val();
    },
    handleEnded() {
        if (currentPlayMode === 1) { // 单曲循环
            musicPlayer.currentTime = 0;
            musicPlayer.play();
        } else {
            mediaControl.next();
        }
    }
} // 媒体控制函数

function loadUrl(url) {
    history.pushState('', '', url);
    fetchAndReplaceContent(url, 'content', 'content', () => {
        setActiveLinkInList($('.list'));
    })
} // 快速调用懒加载

function switchMusic(id, play) {
    tools.queryReplace("id", id);
    songId = id;
    fetch(`${API}/song/detail?ids=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.songs && data.songs.length > 0) {
                const song = data.songs[0];
                document.title = `${tools.formatArtistNames(song.ar)} - ${song.name} | ${appName}`;
                $('#cover').attr('src', song.al.picUrl);
                $('#miniCover').attr('src', song.al.picUrl);
                $('.container').css('background-image', `url(${song.al.picUrl})`);
                $('#songInfo').html(`<b>${song.name}</b><br><span style="font-size:18px">${tools.formatArtistNames(song.ar)}</span>`);
                $('#miniTitle').html(song.name);
                $('#miniArtist').html(tools.formatArtistNames(song.ar));
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: song.name,
                    artist: song.ar.map(artist => artist.name).join("/"),
                    album: song.al.name,
                    artwork: [{ src: song.al.picUrl }]
                });
                const existingTrackIndex = playlist.findIndex(item => item.id === song.id);
                if (existingTrackIndex !== -1) {
                    currentTrackIndex = existingTrackIndex;
                } else {
                    playList.add({
                        id: song.id,
                        name: song.name,
                        ar: song.ar,
                        al: song.al
                    }, true);
                    currentTrackIndex = playlist.length - 1;
                }
                playList.update();

                // 瑞思专注
                const cookieName = `songName=${encodeURIComponent(song.name)}; path=/; domain=3r60.top`;
                const cookieArtist = `artistName=${encodeURIComponent(tools.formatArtistNames(song.ar))}; path=/; domain=3r60.top`;
                document.cookie = cookieName;
                document.cookie = cookieArtist;
            } else {
                console.error("无法获取歌曲详情");
            }
        })
        .catch(error => {
            console.error("获取歌曲详情失败:", error);
        });

    mediaPlay(id, play);

    fetch(`${API}/lyric?id=${id}`)
        .then(response => response.json())
        .then(data => {
            let lrcContent = data.lrc.lyric;
            let tlyricContent = data.tlyric ? data.tlyric.lyric : '';
            let lrcArray = lyrics.getArray(lrcContent, tlyricContent);
            $('#ullrc').html('');
            lyrics.init(lrcArray);
            musicPlayer.ontimeupdate = lyrics.timeupdate;
        })
        .catch(error => {
            console.error("获取歌词失败:", error);
        });
} // 切换音乐

const lyrics = {
    init(lrcArray) {
        currentLrcs = lrcArray;
        let ul = $('#ullrc');
        lrcArray.push({ seconds: (lrcArray[lrcArray.length - 1].seconds + 100), words: "", tlyric: "" });
        lrcArray.forEach(lrcObj => {
            let li = $('<li></li>').data('seconds', lrcObj.seconds);
            if (lrcObj.tlyric.trim()) {
                li.html(`${lrcObj.words}<br><span class="tl">${lrcObj.tlyric}</span>`);
            } else {
                li.text(lrcObj.words);
            }
            ul.append(li);
        })
    },
    getIndex() {
        time = musicPlayer.currentTime + turn;
        lrcElements = $('#ullrc').find('li');
        for (let index = 0; index < lrcElements.length; index++) {
            if ($(lrcElements[index]).data('seconds') > time) {
                return index - 1;
            }
        }
        return -1;
    },
    timeupdate() {
        index = lyrics.getIndex();
        if (index === -1) return;
        lrc_ul_element = $('#ullrc')[0];
        lrc_li_elements = lrc_ul_element.getElementsByTagName('li');
        currentLrcElement = lrc_li_elements[index];
        activeLi = lrc_ul_element.querySelector('.active');

        if (activeLi) {
            activeLi.classList.remove('active');
        }
        currentLrcElement.classList.add('active');

        container = $('.container');

        if (!autoScrollEnabled) return;

        if (!container.hasClass('hidden2')) {
            systemScroll = true;
            currentLrcElement.scrollIntoView({ block: "center", behavior: 'smooth' });
            setTimeout(() => {
                systemScroll = false;
            }, 500);
        }

        // 瑞思专注
        document.cookie = `currentLrc=${encodeURIComponent(currentLrcElement.innerText)}; path=/; domain=3r60.top`;
        document.cookie = `currentLrc2=${encodeURIComponent(currentLrcs[index].words + " " + currentLrcs[index].tlyric)}; path=/; domain=3r60.top`;
    },
    getArray(content, tlyricContent) {
        let parts = content.split("\n");
        let tparts = tlyricContent.split("\n");

        let lyrics = [];
        let tlyrics = [];

        parts.forEach(part => {
            if (part.trim() !== '') {
                lyrics.push(getLrcObj(part));
            }
        });

        tparts.forEach(part => {
            if (part.trim() !== '') {
                tlyrics.push(getTlyricObj(part));
            }
        });

        return lyrics.map(lrcObj => {
            let tlyric = tlyrics.find(t => t.seconds === lrcObj.seconds);
            return {
                ...lrcObj,
                tlyric: tlyric ? tlyric.words : ''
            };
        });

        function getLrcObj(content) {
            let twoParts = content.split("]");
            let time = twoParts[0].substr(1);
            let timeParts = time.split(":");
            let seconds = +timeParts[1];
            let min = +timeParts[0];
            let totalSeconds = min * 60 + seconds;
            let words = twoParts[1];
            return {
                seconds: totalSeconds,
                words: words
            };
        }

        function getTlyricObj(content) {
            return getLrcObj(content);
        }
    },
    handleScroll() {
        if (systemScroll) {
            autoScrollEnabled = true;
            return;
        }
        autoScrollEnabled = false;
        var ulElement = document.querySelector('#ullrc');
        if (ulElement) {
            var liElements = ulElement.querySelectorAll('li');
            for (var i = 0; i < liElements.length; i++) {
                liElements[i].classList.add('filterNone');
            }
        }
        lyrics.scrollEnd();
    },
    scrollEnd() {
        clearTimeout(scrollTimeoutId);
        scrollTimeoutId = setTimeout(() => {
            autoScrollEnabled = true;
            var ulElement = document.querySelector('#ullrc');
            if (ulElement) {
                var liElements = ulElement.querySelectorAll('li');
                for (var i = 0; i < liElements.length; i++) {
                    liElements[i].classList.remove('filterNone');
                }
            }
        }, 1500);
    }
} // 歌词相关

const playList = {
    init() {
        const saved = localStorage.getItem('playlist');
        if (saved) {
            playlist = JSON.parse(saved);
            currentTrackIndex = parseInt(localStorage.getItem('currentTrackIndex')) || -1;
            playList.update();
        }
    },
    add(songInfo, autoPlay = true, appendAfterCurrent = false) {
        const exists = playlist.some(item => item.id === songInfo.id);
        if (!exists) {
            if (appendAfterCurrent && currentTrackIndex !== -1) {
                playlist.splice(currentTrackIndex + 1, 0, songInfo);
            } else {
                playlist.push(songInfo);
            }

            if (currentTrackIndex === -1) currentTrackIndex = 0;
            playList.update();
            if (autoPlay) switchMusic(songInfo.id, "true");
        }
        playList.save();
    },
    del(index) {
        playlist.splice(index, 1);
        if (currentTrackIndex >= index) currentTrackIndex--;
        if (currentTrackIndex < 0 && playlist.length > 0) currentTrackIndex = 0;
        playList.update();
        if (playlist.length === 0) {
            musicPlayer.pause();
            resetPlayerUI();
        }
        playList.save();

    },
    save() {
        localStorage.setItem('playlist', JSON.stringify(playlist));
        localStorage.setItem('currentTrackIndex', currentTrackIndex);
        localStorage.setItem('playMode', currentPlayMode);
    },
    track(index) {
        if (index >= 0 && index < playlist.length) {
            currentTrackIndex = index;
            switchMusic(playlist[index].id, "true");
            playList.update();
        }
    },
    update() {
        const playlistItems = $('#playlistItems');
        playlistItems.empty();

        console.log(currentTrackIndex);

        playlist.forEach((item, index) => {
            const li = $(
                `<li class="playlist-item ${index === currentTrackIndex ? 'active" id="playlist-active"' : '"'}>
                <div>
                    <div>${item.name}</div>
                    <small>${tools.formatArtistNames(item.ar)}</small>
                </div>
                <button class="btn btn-sm btn-white" onclick="playList.del(${index})">
                    <i class="bi bi-x"></i>
                </button>
            </li>`
            );
            li.click(() => playList.track(index));
            playlistItems.append(li);
        });

        if ($('#musicLists')) {
            $('#musicLists tr.active').removeClass('active');
            $('#music_' + playlist[currentTrackIndex].id).addClass('active');
        }

        document.getElementById('playlist-active').scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
} // 播放列表

const playMode = {
    init() {
        const savedMode = localStorage.getItem('playMode');
        if (savedMode) currentPlayMode = parseInt(savedMode);
        playMode.update();
    },
    toggle() {
        currentPlayMode = (currentPlayMode + 1) % playModes.length;
        localStorage.setItem('playMode', currentPlayMode);
        playMode.update();
    },
    update() {
        const modeButton = $('#playModeButton');
        modeButton.html(`<i class="bi ${playMode_icons[currentPlayMode]}"></i>`);
        modeButton.attr('title', playMode_titles[currentPlayMode]);
        modeButton.toggleClass('active-mode', true);
    }
} // 播放模式

function desktopLyrics() {
    const windowFeatures = [
        'width=300',
        'height=200',
        'top=' + (screen.height / 2 - 100),
        'left=' + (screen.width / 2 - 150),
        'toolbar=no',
        'menubar=no',
        'status=no',
        'location=no',
        'resizable=no',
        'scrollbars=no',
        'titlebar=no',
        'alwaysRaised=yes'
    ].join(',');

    const newWindow = window.open('https://music.3r60.top/app/lyrics.html', '', windowFeatures);
    if (newWindow) {
        newWindow.focus();
    } else {
        alert('无法创建新窗口，请检查浏览器设置');
    }
} // 桌面歌词

function bindMenu() {
    $("tr[id^='music_']").on("contextmenu", function (event) {
        event.preventDefault();

        const tdId = $(this).attr("id");
        chosenMusic = {
            id: tdId.substring("music_".length),
            ar: [{ name: $(this).find("td").eq(1).find("a").text() }],
            name: $(this).find("td").eq(0).find("a").text()
        }

        // console.log("右键" + tdId);

        renderContextMenu(menu, event);
    });
}; // 右键菜单