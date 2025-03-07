function requestMusicChange(id) {
    // 向父页面发送消息
    parent.postMessage({
        type: 'CHANGE_MUSIC',
        id: id
    }, "*"); // 替换为您的父页面域
}
function requestMovieChange(id) {
    // 向父页面发送消息
    parent.postMessage({
        type: 'CHANGE_MOVIE',
        id: id
    }, "*"); // 替换为您的父页面域
}