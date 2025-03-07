let componentsLoaded = 0;

// miniPlayer
$("#miniPlayer").load("./components/player.html", function (response, status, xhr) {
	if (status === "success") {
		console.log("[Ris-Music] 播放控制区装载成功");
		handleInit();
	} else if (status === "error") {
		console.log("[Ris-Music] 播放控制区装载失败");
	}
});

// playlistSidebar
$("#playlistSidebar").load("./components/playList.html", function (response, status, xhr) {
	if (status === "success") {
		console.log("[Ris-Music] 播放列表装载成功");
		handleInit();
	} else if (status === "error") {
		console.log("[Ris-Music] 播放列表装载失败");
	}
});

// playPage
$("#playPage").load("./components/playPage.html", function (response, status, xhr) {
	if (status === "success") {
		console.log("[Ris-Music] 播放页面装载成功");
		handleInit();
	} else if (status === "error") {
		console.log("[Ris-Music] 播放页面装载失败");
	}
});

function handleInit() {
	componentsLoaded = componentsLoaded + 1;
	if (componentsLoaded >= 3) {
		init();
	}
}