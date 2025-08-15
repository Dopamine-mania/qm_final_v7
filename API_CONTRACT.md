# API合同 V1.2 - 音乐疗愈应用 (增强体验版)

**项目基准**：本文档是前后端开发的唯一依据，所有相关代码实现必须严格遵守此合同中定义的结构和字段名。

---

## 外部API: `GET /api/session_status?id={sessionId}`

该接口是前端轮询的核心。它会根据后台任务的进度，返回一个包含 `status` 和 `result` 字段的JSON对象。

---

### 状态 1: 情感分析完成 (`AC_COMPLETE`)

**后端实现要点**:
1.  调用 `EmotionInferenceAPI` 的 `analyze_single_text(text, "top_k", k=7)` 方法，获取排名前**7**的情绪。
2.  将这7个情绪的名称和分数，打包成一个对象数组 `topEmotions`。
3.  动态拼接成 `title` 和 `description` 字符串。

**JSON结构:**
```json
{
  "status": "AC_COMPLETE",
  "result": {
    "analysisResult": {
      "title": "深度悲伤",
      "description": "我们感受到了您内心深处的悲伤，它似乎还交织着对过往的思念...",
      "topEmotions": [
        {"name": "悲伤", "score": 0.85},
        {"name": "思念", "score": 0.60},
        {"name": "疲倦", "score": 0.40},
        {"name": "平静", "score": 0.30},
        {"name": "孤独", "score": 0.25},
        {"name": "失落", "score": 0.20},
        {"name": "无助", "score": 0.15}
      ]
    }
  }
}
```

**核心修改**: 我们现在要求后端返回排名前7的情绪，并以一个topEmotions数组的形式提供。

状态 2: 知识图谱解码完成 (KG_COMPLETE)
触发时机: 后端 background_task 调用知识图谱模块 (EmotionMusicBridge) 并成功获得结果后。

后端实现要点:

从 EmotionMusicBridge 的返回结果中，提取 "music_parameters"。

将这些参数打包成 details 数组。

在此阶段，不暴露ISO原则的详细解释。

JSON结构:

JSON

{
  "status": "KG_COMPLETE",
  "result": {
    "analysisResult": {
      "title": "深度悲伤",
      "description": "系统捕捉到您内心的孤独与失落感，正在为您寻找共鸣与慰藉。"
    },
    "kgResult": {
      "title": "疗愈处方已生成",
      "details": [
        "音乐主题: 希望与慰藉",
        "建议节奏: 60-80 BPM (慢板)",
        "调式: C大调 (温暖、稳定)"
      ]
    }
  }
}
前端对应关系:

result.kgResult.title -> id="kg-title"

result.kgResult.details (数组) -> 前端需遍历此数组，动态创建HTML元素并填入到 id="kg-details" 的容器中。

状态 3: 疗愈原则准备就绪 (ISO_PRINCIPLE_READY)
触发时机: 后端在完成知识图谱解码后，立刻更新到这个新状态，用于专门展示ISO原则。

后端实现要点:

从 EmotionMusicBridge 的返回结果中，提取 "therapy_recommendation" 部分，特别是关于ISO原则的解释。

将这些信息打包成 isoPrinciple 对象。

JSON结构:

JSON

{
  "status": "ISO_PRINCIPLE_READY",
  "result": {
    "analysisResult": { ... },
    "kgResult": { ... },
    "isoPrinciple": {
      "title": "正在应用：同质原理 (ISO Principle)",
      "description": "“同质原理”是音乐治疗的核心理念之一，意指用与您当前情绪状态相似的音乐来引导共鸣，从而达到宣泄、接受并最终转化的疗愈效果。"
    }
  }
}
前端对应关系:

前端需要创建一个新的展示卡片/区域 (例如 <div id="step-iso-principle">)。

result.isoPrinciple.title -> 填入到新区域的标题元素中。

result.isoPrinciple.description -> 填入到新区域的描述元素中。

状态 4: 视频准备就绪 (VIDEO_READY)
触发时机: 后端 background_task 调用音乐检索模块 (MusicSearchAPI) 并成功获得结果后。这是流程的终点。

后端实现要点:

将 kgResult 中的音乐描述文本，传入 MusicSearchAPI 的 search_by_description(...) 方法。

从返回的 results 列表中，通常选择第一个（相似度最高的）结果。

根据 video_name 和 duration，拼接成一个完整的、可公开访问的URL。

JSON结构:

JSON

{
  "status": "VIDEO_READY",
  "result": {
    "analysisResult": { ... },
    "kgResult": { ... },
    "isoPrinciple": { ... },
    "video": {
      "url": "[https://pub-263b71ccbad648af97436d9666ca337e.r2.dev/segments_3min/32_3min_01.mp4](https://pub-263b71ccbad648af97436d9666ca337e.r2.dev/segments_3min/32_3min_01.mp4)",
      "title": "32_3min_01"
    }
  }
}
前端对应关系:

result.video.title -> id="video-title"

result.video.url -> 将被设置为 id="healing-video" 的 src 属性。


这份合同现已最终敲定。请保存好这个文件，它将是你接下来开发工作中最重要的向导。