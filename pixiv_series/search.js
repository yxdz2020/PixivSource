@js:
var util = objParse(String(java.get("util")))

function objParse(obj) {
    return JSON.parse(obj, (n, v) => {
        if (typeof v == "string" && v.match("()")) {
            return eval(`(${v})`)
        }
        return v;
    })
}

// 处理 novels 列表, 查询作者
function handNovels(novels) {
    novels.forEach(novel => {
        if (novel.tags === undefined || novel.tags === null) {
            novel.tags = []
        }
        // 最大化使用搜索获得的数据
        novel.textCount = novel.textLength
        novel.url = novel.cover.urls["480mw"]
        novel.description = novel.caption
        // novel.tags = novel.tags

        if (novel.isOneshot === true) {  //单篇小说
            novel.seriesId = undefined
            novel.id = novel.novelId
            novel.name = novel.latestChapter = novel.title
            novel.tags.unshift("单本")

        } else {  // 系列小说
            novel.seriesId = novel.id  // 真正的系列小说id
            // novel.id = novel.latestEpisodeId  // 最近一篇
            // novel.lastChapter = this.getAjaxJson(this.urlNovelDetailed(novel.id)).body.title
            novel.name = novel.title

            let userAllWorks = util.getAjaxJson(util.urlUserAllWorks(novel.userId)).body
            for (let series of userAllWorks.novelSeries) {
                if (series.id === novel.seriesId) {
                    let series = util.getAjaxJson(util.urlSeries(novel.seriesId)).body
                    novel.id = series.firstNovelId

                    // 发送请求获取第一章 获取标签与简介
                    if (novel.tags.length === 0 || novel.description === "") {
                        let firstNovel = util.getAjaxJson(util.urlNovelDetailed(series.firstNovelId)).body
                        if (novel.tags.length === 0) {
                            novel.tags = firstNovel.tags.tags.map(item => item.tag)
                        }

                        if (novel.description === "") {
                            novel.description = firstNovel.description
                        }
                    }

                    novel.tags.unshift("长篇")
                    break
                }
            }
        }
    })
    util.debugFunc(() => {
        java.log(`处理小说完成`)
    })
    return novels
}

(() => {
    let resp = JSON.parse(result);
    return util.formatNovels(handNovels(resp.body.novel.data))
})();