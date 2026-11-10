/* 方仔打工人生存指南 — static H5, no third-party libs */
(function () {
  "use strict";

  var FONT =
    '"Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Heiti SC", "Source Han Sans SC", sans-serif';

  var START_METERS = { energy: 68, mood: 52, salary: 54 };

  var STICKER_FILES = {
    "01": "assets/stickers/f01.png",
    "02": "assets/stickers/f02.png",
    "03": "assets/stickers/f03.png",
    "05": "assets/stickers/f05.png",
    "06": "assets/stickers/f06.png",
    "07": "assets/stickers/f07.png",
    "08": "assets/stickers/f08.png",
    "11": "assets/stickers/f11.png",
    "13": "assets/stickers/f13.png",
    "16": "assets/stickers/f16.png",
    "17": "assets/stickers/f17.png",
    "18": "assets/stickers/f18.png",
    "19": "assets/stickers/f19.png",
    "20": "assets/stickers/f20.png",
    "22": "assets/stickers/f22.png",
    "23": "assets/stickers/f23.png",
    "24": "assets/stickers/f24.png"
  };

  var SLOTS = [
    {
      id: "commute",
      time: "08:16",
      period: "早晨",
      periodClass: "morning",
      variants: [
        {
          id: "subway",
          sticker: "18",
          title: "早高峰",
          body: "地铁门一开，方仔被轻轻拥进了车厢。今天的站姿是「人贴人特别版」，扶手只是传说。",
          options: [
            { text: "戴上耳机，进入结界，谁也进不来", d: { energy: -4, mood: 8, salary: 0 }, tags: ["slack"] },
            { text: "闭眼补觉，在下一站被广播吓醒", d: { energy: 10, mood: -4, salary: 0 }, tags: [] },
            { text: "给旁边挤出半个脚的空间，自己再贴紧点", d: { energy: -10, mood: 6, salary: 0 }, tags: [] }
          ]
        },
        {
          id: "bus",
          sticker: "18",
          title: "早高峰",
          body: "公交晚点了八分钟，站台风有点大。方仔看了眼时间，又看了眼远处缓缓移动的红灯。",
          options: [
            { text: "改骑共享单车，风里冲一把", d: { energy: -10, mood: 4, salary: -2 }, tags: ["grind"] },
            { text: "继续等，边刷短视频边跺脚取暖", d: { energy: -2, mood: 6, salary: 0 }, tags: ["slack"] },
            { text: "打车垫上，把时间买回来", d: { energy: 6, mood: 6, salary: -16 }, tags: ["spend"] }
          ]
        }
      ]
    },
    {
      id: "standup",
      time: "09:31",
      period: "上午",
      periodClass: "morning",
      variants: [
        {
          id: "standup-long",
          sticker: "08",
          title: "早会",
          body: "早会号称十五分钟。十五分钟后，还在同步「再补充两点」。方仔的膝盖已经开始想念椅子。",
          options: [
            { text: "认真记笔记，还画了几个箭头", d: { energy: -8, mood: -4, salary: 4 }, tags: ["grind"] },
            { text: "点头如捣蒜，大脑暂时去放空", d: { energy: 2, mood: 6, salary: -2 }, tags: ["slack"] },
            { text: "申请去倒杯水，顺便让膝盖透透气", d: { energy: 4, mood: 4, salary: 0 }, tags: ["break"] }
          ]
        },
        {
          id: "weekly",
          sticker: "08",
          title: "周会",
          body: "周会开始两分钟，投影仪准时罢工。会议室陷入了「有人会修吗」的集体沉默。",
          options: [
            { text: "默默去插线，当了编外 IT", d: { energy: -8, mood: 2, salary: 2 }, tags: ["grind"] },
            { text: "趁乱在聊天框里发了个表情包", d: { energy: 0, mood: 8, salary: -2 }, tags: ["slack"] },
            { text: "建议改成口头同步，五分钟结束", d: { energy: 6, mood: 6, salary: 2 }, tags: [] }
          ]
        }
      ]
    },
    {
      id: "urgent",
      time: "10:42",
      period: "上午",
      periodClass: "morning",
      variants: [
        {
          id: "boss",
          sticker: "16",
          title: "临时需求",
          body: "老板甩来一句「这个很急，今天要」。附件还在路上，截止时间已经坐在桌子上了。",
          options: [
            { text: "立刻上手，午饭往后挪", d: { energy: -14, mood: -12, salary: 10 }, tags: ["grind"] },
            { text: "先问清范围和真正的截止时间", d: { energy: -6, mood: 2, salary: 6 }, tags: [] },
            { text: "回「我先看看」，然后去倒了杯水", d: { energy: 4, mood: 6, salary: -4 }, tags: ["slack", "break"] }
          ]
        },
        {
          id: "outage",
          sticker: "22",
          title: "系统告急",
          body: "系统先罢工了，群里开始@所有人。方仔的屏幕还停在转圈，消息已经堆成了楼梯。",
          options: [
            { text: "先截图，证明卡在加载画面上", d: { energy: -2, mood: 4, salary: 0 }, tags: ["slack"] },
            { text: "主动帮忙排查，当救火队员", d: { energy: -10, mood: -6, salary: 8 }, tags: ["grind"] },
            { text: "正好去茶水间躲一会儿", d: { energy: 6, mood: 8, salary: -8 }, tags: ["slack", "break"] }
          ]
        }
      ]
    },
    {
      id: "lunch",
      time: "12:18",
      period: "中午",
      periodClass: "noon",
      variants: [
        {
          id: "canteen",
          sticker: "20",
          title: "午饭时间",
          body: "食堂今日推荐是「微辣」。方仔夹起第一筷，意识到微辣和勇敢之间，隔着一个胃。",
          options: [
            { text: "还是吃完，给自己一点英雄剧情", d: { energy: -4, mood: 4, salary: 2 }, tags: [] },
            { text: "转向窗外那家面馆，细水长流", d: { energy: 6, mood: 10, salary: -12 }, tags: ["spend"] },
            { text: "抽屉里还有昨天的饼干，先垫垫", d: { energy: -2, mood: -10, salary: 4 }, tags: [] }
          ]
        },
        {
          id: "takeout",
          sticker: "20",
          title: "午饭时间",
          body: "同事发起点外卖，对话框停在「你想吃什么」已经三分钟。菜单在滚动，决定还没有来。",
          options: [
            { text: "甩出两家收藏店，迅速收束", d: { energy: 4, mood: 6, salary: -10 }, tags: ["spend"] },
            { text: "说「我都好」，然后开始温和否决", d: { energy: -4, mood: -6, salary: 0 }, tags: [] },
            { text: "自己带了便当，安静去加热", d: { energy: 4, mood: 4, salary: 6 }, tags: [] }
          ]
        }
      ]
    },
    {
      id: "tea",
      time: "15:03",
      period: "下午",
      periodClass: "afternoon",
      variants: [
        {
          id: "sleepy",
          sticker: "11",
          title: "下午三点",
          body: "下午三点，眼皮开始和屏幕比赛谁先倒下。表格还在，意志已经去茶水间排队了。",
          options: [
            { text: "去茶水间续命，顺便听两句八卦", d: { energy: 8, mood: 8, salary: -2 }, tags: ["break"] },
            { text: "冷水洗把脸，继续把表填完", d: { energy: -8, mood: -4, salary: 6 }, tags: ["grind"] },
            { text: "打开一张很忙的表，开始神游", d: { energy: 6, mood: 10, salary: -4 }, tags: ["slack"] }
          ]
        },
        {
          id: "snacks",
          sticker: "11",
          title: "下午茶出现了",
          body: "茶水间突然出现了一盒饼干，像是某种集体信号。方仔站在门口，进行了三秒钟的思想斗争。",
          options: [
            { text: "拿两块，顺便社交两句", d: { energy: 4, mood: 8, salary: 0 }, tags: ["break"] },
            { text: "默默拿一块就走，生怕被拉进长聊", d: { energy: 2, mood: 2, salary: 0 }, tags: [] },
            { text: "「我在赶东西」，眼神坚定地路过", d: { energy: -4, mood: -2, salary: 4 }, tags: ["grind"] }
          ]
        }
      ]
    },
    {
      id: "blame",
      time: "16:26",
      period: "下午",
      periodClass: "afternoon",
      variants: [
        {
          id: "pot",
          sticker: "13",
          title: "锅来了",
          body: "群里有人把一句话写得很委婉：是不是可以请方仔再看一眼？锅盖掀开一条缝，热气已经过来了。",
          options: [
            { text: "列出时间线和截图，把事实摆好", d: { energy: -8, mood: -4, salary: 6 }, tags: ["grind"] },
            { text: "先去走廊里走两分钟，回来再回复", d: { energy: 2, mood: 4, salary: 0 }, tags: ["break"] },
            { text: "回一个「收到」，先把这轮浪避过去", d: { energy: 2, mood: 6, salary: -10 }, tags: ["slack"] }
          ]
        },
        {
          id: "cross",
          sticker: "13",
          title: "跨组来催",
          body: "跨组消息跳出来：「那个数据昨天就该有了吧？」方仔翻了翻记录，需求是今天早上才发的。",
          options: [
            { text: "今晚整理好再发，先把火灭掉", d: { energy: -12, mood: -10, salary: 8 }, tags: ["grind"] },
            { text: "说明时点，给一个可先用的大致范围", d: { energy: -4, mood: 2, salary: 4 }, tags: [] },
            { text: "回「我去翻翻」，然后去茶水间站一会儿", d: { energy: 4, mood: 4, salary: -8 }, tags: ["slack", "break"] }
          ]
        }
      ]
    },
    {
      id: "overtime",
      time: "17:48",
      period: "傍晚",
      periodClass: "evening",
      variants: [
        {
          id: "invite",
          sticker: "05",
          title: "加班邀请",
          body: "组长在群里问：今晚谁还方便再看一眼？消息下面安静了四秒，像是集体在等别人先说话。",
          options: [
            { text: "「没问题，我再留一会儿。」", d: { energy: -16, mood: -12, salary: 12 }, tags: ["grind"] },
            { text: "「今天有事先走，明早第一件事处理。」", d: { energy: 8, mood: 8, salary: -4 }, tags: ["punctual"] },
            { text: "「我回家看一下」，把电脑装进包里", d: { energy: -8, mood: -4, salary: 4 }, tags: ["grind"] }
          ]
        },
        {
          id: "watch",
          sticker: "05",
          title: "今晚要守着吗",
          body: "临时出了个小问题，有人说「今晚最好守一下」。方仔看了眼已经暗下来的窗外，又看了眼右下角的时钟。",
          options: [
            { text: "留下守着，把这摊先收住", d: { energy: -16, mood: -12, salary: 10 }, tags: ["grind"] },
            { text: "写好交接，说明明早可以接上", d: { energy: 4, mood: 6, salary: 2 }, tags: ["punctual"] },
            { text: "先问清楚：是守着，还是处理完就能走", d: { energy: -6, mood: 2, salary: 4 }, tags: [] }
          ]
        }
      ]
    },
    {
      id: "leave",
      time: "17:55",
      period: "傍晚",
      periodClass: "evening",
      variants: [
        {
          id: "meeting",
          sticker: "07",
          title: "下班前五分钟",
          body: "电脑右下角跳出一个红色会议邀请，时间是「现在」。方仔的手指停在触控板上，背包已经站了起来。",
          options: [
            { text: "已读不回，拉链拉得很坚定", d: { energy: 6, mood: 10, salary: -4 }, tags: ["punctual"] },
            { text: "还是点进去，再听十分钟", d: { energy: -8, mood: -10, salary: 6 }, tags: ["grind"] },
            { text: "回「我在路上」，边走边听", d: { energy: -2, mood: 2, salary: 2 }, tags: [] }
          ]
        },
        {
          id: "revision",
          sticker: "07",
          title: "下班前五分钟",
          body: "有人在文档下面说：「再改一版吧，很快的。」时钟离整点还差五分钟，方仔的鼠标悬在关机键上。",
          options: [
            { text: "「明天第一件事」，然后关机", d: { energy: 6, mood: 8, salary: 0 }, tags: ["punctual"] },
            { text: "留下改到自己满意", d: { energy: -12, mood: -8, salary: 8 }, tags: ["grind"] },
            { text: "先保存，把问题记在便签上带走", d: { energy: -2, mood: 4, salary: 2 }, tags: [] }
          ]
        }
      ]
    }
  ];

  var TITLES = {
    grindKing: {
      id: "grindKing",
      title: "卷王",
      sticker: "05",
      text: "需求来了就接，会议来了就开，方仔的工位今晚灯火通明。生存指南批注：很能打，也记得明天给自己留一点电。"
    },
    slackMaster: {
      id: "slackMaster",
      title: "摸鱼大师",
      sticker: "06",
      text: "今天的正式工时大约四十分钟，其余时间都在进行深度思考——至于思考的是需求还是晚饭，不必写进周报。"
    },
    punctualHero: {
      id: "punctualHero",
      title: "准点下班侠",
      sticker: "07",
      text: "下班铃一响，背包拉链比会议邀请更快。不是不负责，只是今天的待办刚好排到了明天。"
    },
    paidBreak: {
      id: "paidBreak",
      title: "带薪拉屎冠军",
      sticker: "24",
      text: "茶水间去了两趟，隔间里完成了今日最清晰的思考。效率高得不便写进日报，但心情确实回来了。"
    },
    lively: {
      id: "lively",
      title: "元气打工人",
      sticker: "19",
      text: "精力还在，心情也在，像周五提前降临在了工作日。这种一天值得写进生存指南的封面。"
    },
    wallet: {
      id: "wallet",
      title: "钱包守护者",
      sticker: "02",
      text: "午饭克制，打车忍住，这个月的工资条暂时安全。方仔拍了拍口袋：今天，是财政纪律的胜利。"
    },
    tiredSmile: {
      id: "tiredSmile",
      title: "好累但还在笑",
      sticker: "11",
      text: "电量告急，嘴角还在坚持。方仔端着杯子表示：累是真的，但今天没有白过。"
    },
    balanced: {
      id: "balanced",
      title: "社畜平衡术",
      sticker: "01",
      text: "该回的回了，该躲的躲了，三条数值谁也没被丢下。这大概就是打工人最想要的普通一天。"
    },
    veteran: {
      id: "veteran",
      title: "职场老油条",
      sticker: "23",
      text: "收到、稍等、我看看——今天的口令都很标准。方仔安然活到下班，还给明天留了点力气。"
    },
    drained: {
      id: "drained",
      title: "电量耗尽",
      sticker: "17",
      early: "energy",
      text: "还没等到下班铃，精力条先一步躺平。方仔进入工位休眠模式，建议先充电，再回消息。"
    },
    moodOut: {
      id: "moodOut",
      title: "心态先下班",
      sticker: "22",
      early: "mood",
      text: "群还在跳，心情条已经走了。不是已读不回，是今天的情绪额度真的用完了。明天再上线。"
    },
    broke: {
      id: "broke",
      title: "钱包先行下班",
      sticker: "13",
      early: "salary",
      text: "垫付、外卖和临时开支联手行动，这个月的余额先一步离开工位。方仔还坐着，口袋已经下班了。"
    }
  };


  var images = {};
  var els = {};
  var state = {
    mode: "start",
    seed: 1,
    index: 0,
    plan: [],
    meters: Object.assign({}, START_METERS),
    flags: emptyFlags(),
    history: [],
    early: null,
    result: null,
    date: new Date(),
    computeTimer: 0
  };

  var picking = false;

  function emptyFlags() {
    return { slack: 0, grind: 0, punctual: 0, break: 0, spend: 0 };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashState(meters, flags, early) {
    var s =
      (meters.energy | 0) +
      "," +
      (meters.mood | 0) +
      "," +
      (meters.salary | 0) +
      "," +
      (flags.slack | 0) +
      (flags.grind | 0) +
      (flags.punctual | 0) +
      (flags.break | 0) +
      (flags.spend | 0) +
      "," +
      (early || "");
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function formatDate(d) {
    d = d || new Date();
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }

  function dateStamp(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = "0" + m;
    if (day.length < 2) day = "0" + day;
    return String(d.getFullYear()) + m + day;
  }

  function currentItem() {
    return state.plan[state.index];
  }

  function pickPlan(seed, forcedVariants) {
    var plan = [];
    for (var i = 0; i < SLOTS.length; i++) {
      var slot = SLOTS[i];
      var rng = mulberry32((seed + i * 97 + 13) >>> 0);
      var vi = Math.floor(rng() * slot.variants.length);
      if (forcedVariants && forcedVariants[i] != null) {
        vi = clamp(forcedVariants[i], 0, slot.variants.length - 1);
      }
      plan.push({
        slotIndex: i,
        variantIndex: vi,
        slot: slot,
        event: slot.variants[vi]
      });
    }
    return plan;
  }

  function applyDelta(meters, flags, option) {
    var d = option.d || {};
    meters.energy = clamp((meters.energy | 0) + (d.energy | 0), 0, 100);
    meters.mood = clamp((meters.mood | 0) + (d.mood | 0), 0, 100);
    meters.salary = clamp((meters.salary | 0) + (d.salary | 0), 0, 100);
    var tags = option.tags || [];
    for (var i = 0; i < tags.length; i++) {
      if (flags[tags[i]] != null) flags[tags[i]] += 1;
    }
  }

  function detectEarly(meters) {
    if (meters.energy <= 0) return "energy";
    if (meters.mood <= 0) return "mood";
    if (meters.salary <= 0) return "salary";
    return null;
  }

  function computeEnding(meters, flags, early) {
    meters = meters || START_METERS;
    flags = flags || emptyFlags();
    var e = meters.energy | 0;
    var m = meters.mood | 0;
    var s = meters.salary | 0;
    var tier;
    if (early === "energy") tier = TITLES.drained;
    else if (early === "mood") tier = TITLES.moodOut;
    else if (early === "salary") tier = TITLES.broke;
    else if ((flags.grind | 0) >= 4 && s >= 68 && e <= 55) tier = TITLES.grindKing;
    else if ((flags.slack | 0) >= 4 && m >= 58) tier = TITLES.slackMaster;
    else if ((flags.punctual | 0) >= 2 && e >= 50) tier = TITLES.punctualHero;
    else if ((flags.break | 0) >= 3) tier = TITLES.paidBreak;
    else if (e >= 70 && m >= 70) tier = TITLES.lively;
    else if (s >= 82 && (flags.spend | 0) <= 1) tier = TITLES.wallet;
    else if (e < 42 && m >= 64) tier = TITLES.tiredSmile;
    else if (e >= 48 && m >= 48 && s >= 48 && Math.max(e, m, s) - Math.min(e, m, s) <= 24) {
      tier = TITLES.balanced;
    } else tier = TITLES.veteran;

    return {
      id: tier.id,
      title: tier.title,
      text: tier.text,
      sticker: tier.sticker,
      early: early || null,
      meters: { energy: e, mood: m, salary: s },
      flags: copy(flags),
      hash: hashState({ energy: e, mood: m, salary: s }, flags, early || "")
    };
  }

  function shareText(result, date) {
    var earlyLine = result.early ? "（今天提前结束）\n" : "";
    return (
      "我刚玩了「方仔打工人生存指南」，今天的称号是「" +
      result.title +
      "」。\n" +
      earlyLine +
      "精力 " +
      result.meters.energy +
      " / 心情 " +
      result.meters.mood +
      " / 工资 " +
      result.meters.salary +
      "\n" +
      result.text +
      "\n你也来当一天打工人？"
    );
  }

  function fileNameFor(result, date) {
    return "方仔生存指南-" + result.title + "-" + dateStamp(date) + ".png";
  }

  /* ---------- canvas helpers ---------- */
  function roundedRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function isHangPunct(ch) {
    return /[，。！？、；：…—』」》)）]/.test(ch);
  }

  function wrapText(ctx, text, maxWidth) {
    var chars = String(text).split("");
    var lines = [];
    var line = "";
    for (var i = 0; i < chars.length; i++) {
      var next = line + chars[i];
      if (line && ctx.measureText(next).width > maxWidth) {
        if (isHangPunct(chars[i])) {
          line = next;
        } else {
          var breakAt = -1;
          var start = Math.max(0, line.length - 12);
          for (var j = line.length - 1; j >= start; j--) {
            if (/[，。！？、；：…—]/.test(line.charAt(j))) {
              breakAt = j;
              break;
            }
          }
          if (breakAt >= 0 && breakAt < line.length - 1) {
            lines.push(line.slice(0, breakAt + 1));
            line = line.slice(breakAt + 1) + chars[i];
          } else {
            lines.push(line);
            line = chars[i];
          }
        }
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawSticker(ctx, key, cx, cy, maxSide) {
    var img = images[key];
    if (!img || !img.width) return;
    var scale = maxSide / Math.max(img.width, img.height);
    var w = img.width * scale;
    var h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  }

  function drawMeter(ctx, x, y, w, label, value, color, color2) {
    ctx.font = "800 28px " + FONT;
    ctx.fillStyle = "#5c4a36";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 10);
    ctx.font = "800 28px " + FONT;
    ctx.textAlign = "right";
    ctx.fillStyle = "#2a2218";
    ctx.fillText(String(value), x + w, y + 10);

    var trackY = y + 28;
    var trackH = 18;
    roundedRect(ctx, x, trackY, w, trackH, 9);
    ctx.fillStyle = "rgba(42, 34, 24, 0.1)";
    ctx.fill();

    var pct = clamp(value, 0, 100) / 100;
    if (pct > 0) {
      ctx.save();
      roundedRect(ctx, x, trackY, w, trackH, 9);
      ctx.clip();
      var grd = ctx.createLinearGradient(x, 0, x + w, 0);
      grd.addColorStop(0, color);
      grd.addColorStop(1, color2);
      ctx.fillStyle = grd;
      ctx.fillRect(x, trackY, Math.max(16, w * pct), trackH);
      ctx.restore();
    }
  }

  function renderCard(canvas, result, date) {
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    var rng = mulberry32(result.hash || 1);

    ctx.clearRect(0, 0, W, H);

    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#fff8eb");
    bg.addColorStop(0.5, "#f7eed8");
    bg.addColorStop(1, "#edd6a4");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var i;
    for (i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.fillStyle = rng() > 0.5 ? "rgba(245, 197, 66, 0.13)" : "rgba(58, 168, 154, 0.1)";
      ctx.arc(70 + rng() * (W - 140), 80 + rng() * (H - 160), 12 + rng() * 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // paper form frame
    roundedRect(ctx, 48, 48, W - 96, H - 96, 36);
    ctx.fillStyle = "rgba(255, 252, 244, 0.72)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(107, 74, 40, 0.18)";
    ctx.stroke();

    // punch holes
    for (i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.fillStyle = "#ead9b0";
      ctx.strokeStyle = "rgba(107, 74, 40, 0.2)";
      ctx.lineWidth = 2;
      var hy = 150 + i * 190;
      ctx.arc(92, hy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.font = "800 28px " + FONT;
    ctx.fillStyle = "#8a7358";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("方仔打工人生存指南", 140, 88);

    ctx.font = "600 26px " + FONT;
    ctx.textAlign = "right";
    ctx.fillText(result.early ? "今日提前结束" : "今日生存鉴定", W - 88, 90);

    // sticker
    drawSticker(ctx, result.sticker, W / 2, 430, 400);

    // title badge
    var title = result.title;
    ctx.font = "900 64px " + FONT;
    var tw = ctx.measureText(title).width;
    var bx = (W - tw - 88) / 2;
    var by = 650;
    roundedRect(ctx, bx, by, tw + 88, 96, 20);
    ctx.fillStyle = "#f5c542";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#c48412";
    ctx.stroke();
    ctx.fillStyle = "#3a2a12";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, W / 2, by + 50);

    // ending text box
    var boxX = 120;
    var boxY = 780;
    var boxW = W - 240;
    var boxH = 250;
    roundedRect(ctx, boxX, boxY, boxW, boxH, 24);
    ctx.fillStyle = "rgba(255, 248, 235, 0.92)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(42, 34, 24, 0.08)";
    ctx.stroke();

    ctx.font = "600 34px " + FONT;
    ctx.fillStyle = "#2a2218";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    var lines = wrapText(ctx, result.text, boxW - 72);
    var lineH = 52;
    var textH = lines.length * lineH;
    var ty = boxY + (boxH - textH) / 2;
    for (i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, ty + i * lineH);
    }

    // meters
    var mx = 160;
    var mw = W - 320;
    var my = 1070;
    drawMeter(ctx, mx, my, mw, "精力", result.meters.energy, "#3aa89a", "#2a8a7e");
    drawMeter(ctx, mx, my + 86, mw, "心情", result.meters.mood, "#ef8d4a", "#d56e28");
    drawMeter(ctx, mx, my + 172, mw, "工资", result.meters.salary, "#d4a017", "#b8860b");

    ctx.font = "600 28px " + FONT;
    ctx.fillStyle = "#8a7358";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatDate(date) + "    作者 hukx", W / 2, H - 92);
  }

  /* ---------- UI ---------- */
  function toast(msg) {
    els.toast.hidden = false;
    els.toast.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      els.toast.hidden = true;
    }, 1600);
  }

  function showScreen(mode) {
    state.mode = mode;
    var map = {
      start: els.start,
      event: els.event,
      compute: els.compute,
      result: els.result
    };
    Object.keys(map).forEach(function (key) {
      var node = map[key];
      var on = key === mode;
      if (on) {
        node.hidden = false;
        requestAnimationFrame(function () {
          node.classList.add("active");
        });
      } else {
        node.classList.remove("active");
        node.hidden = true;
      }
    });
  }

  function setPeriodClass(name) {
    els.stage.classList.remove("period-morning", "period-noon", "period-afternoon", "period-evening");
    if (name) els.stage.classList.add("period-" + name);
  }

  function updateMeters(instant, deltas) {
    var keys = ["energy", "mood", "salary"];
    keys.forEach(function (k) {
      var val = state.meters[k];
      var bar = els.bars[k];
      var label = els.vals[k];
      if (instant) {
        bar.style.transition = "none";
      } else {
        bar.style.transition = "";
      }
      bar.style.width = clamp(val, 0, 100) + "%";
      label.textContent = String(val);
      var row = bar.closest(".meter");
      if (row) row.classList.toggle("low", val <= 18);
    });
    if (instant) {
      void els.bars.energy.offsetWidth;
      keys.forEach(function (k) {
        els.bars[k].style.transition = "";
      });
    }
    if (deltas) showMeterFeedback(deltas);
  }

  function showMeterFeedback(d) {
    var map = { energy: "精力", mood: "心情", salary: "工资" };
    Object.keys(map).forEach(function (k) {
      var n = d[k] | 0;
      if (!n) return;
      var row = els.bars[k].closest(".meter");
      if (!row) return;
      var olds = row.querySelectorAll(".meter-delta");
      for (var i = 0; i < olds.length; i++) olds[i].remove();
      var span = document.createElement("span");
      span.className = "meter-delta " + (n > 0 ? "pos" : "neg");
      span.textContent = (n > 0 ? "+" : "") + n;
      row.appendChild(span);
      setTimeout(function () {
        if (span.parentNode) span.parentNode.removeChild(span);
      }, 750);
    });
  }

  function renderPips() {
    var n = SLOTS.length;
    if (els.pips.childNodes.length !== n) {
      els.pips.innerHTML = "";
      for (var i = 0; i < n; i++) {
        els.pips.appendChild(document.createElement("span"));
      }
    }
    var spans = els.pips.querySelectorAll("span");
    for (var j = 0; j < spans.length; j++) {
      spans[j].className = j < state.index ? "done" : j === state.index ? "current" : "";
    }
  }

  function renderEvent() {
    var item = currentItem();
    if (!item) return;
    var slot = item.slot;
    var ev = item.event;
    els.eventTime.textContent = slot.time;
    els.eventPeriod.textContent = slot.period;
    els.eventProgress.textContent = state.index + 1 + " / " + SLOTS.length;
    setPeriodClass(slot.periodClass);
    renderPips();

    var img = els.eventSticker;
    img.style.animation = "none";
    void img.offsetWidth;
    img.style.animation = "";
    img.src = STICKER_FILES[ev.sticker];
    img.alt = ev.title;

    els.eventTitle.textContent = ev.title;
    els.eventBody.textContent = ev.body;
    els.options.innerHTML = "";
    ev.options.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.textContent = opt.text;
      btn.addEventListener("click", function () {
        onPick(i, btn);
      });
      els.options.appendChild(btn);
    });
  }

  function onPick(optionIndex, btn) {
    if (picking || state.mode !== "event") return;
    var item = currentItem();
    if (!item) return;
    var opt = item.event.options[optionIndex];
    if (!opt) return;
    picking = true;
    btn.classList.add("picked");
    var buttons = els.options.querySelectorAll(".opt");
    for (var i = 0; i < buttons.length; i++) buttons[i].disabled = true;

    var deltas = opt.d || {};
    applyDelta(state.meters, state.flags, opt);
    state.history.push({
      slotIndex: state.index,
      variantId: item.event.id,
      optionIndex: optionIndex,
      deltas: copy(deltas)
    });
    updateMeters(false, deltas);

    var early = detectEarly(state.meters);
    setTimeout(function () {
      picking = false;
      if (early) {
        state.early = early;
        finishDay(true);
      } else if (state.index >= SLOTS.length - 1) {
        state.early = null;
        finishDay(true);
      } else {
        state.index += 1;
        renderEvent();
      }
    }, 720);
  }

  function finishDay(animate) {
    state.result = computeEnding(state.meters, state.flags, state.early);
    state.date = new Date();
    hideSaveOverlay();
    hideCopyOverlay();
    if (animate === false) {
      renderCurrentCard();
      setPeriodClass("evening");
      showScreen("result");
      return;
    }
    if (state.early) {
      els.computeKicker.textContent = "今天到此为止";
      els.computeTitle.textContent = "有一条数值先下班了……";
      els.computeSticker.src = STICKER_FILES[state.result.sticker] || STICKER_FILES["17"];
    } else {
      els.computeKicker.textContent = "正在生成今日鉴定";
      els.computeTitle.textContent = "工位灯还亮着……";
      els.computeSticker.src = STICKER_FILES["23"];
    }
    showScreen("compute");
    clearTimeout(state.computeTimer);
    state.computeTimer = setTimeout(function () {
      renderCurrentCard();
      setPeriodClass("evening");
      showScreen("result");
    }, 900);
  }

  function renderCurrentCard() {
    if (!state.result) return;
    renderCard(els.card, state.result, state.date);
  }

  function resetDayBase(opt) {
    opt = opt || {};
    clearTimeout(state.computeTimer);
    hideSaveOverlay();
    hideCopyOverlay();
    picking = false;
    state.seed = opt.seed != null ? opt.seed >>> 0 : (Math.random() * 0xffffffff) >>> 0;
    state.meters = Object.assign({}, START_METERS, opt.meters || {});
    state.flags = Object.assign(emptyFlags(), opt.flags || {});
    state.history = Array.isArray(opt.history) ? opt.history.slice() : [];
    state.early = opt.early || null;
    state.result = null;
    state.plan = pickPlan(state.seed, opt.variants);
    state.index = 0;
    state.date = opt.date || new Date();
  }

  function goToStart() {
    clearTimeout(state.computeTimer);
    hideSaveOverlay();
    hideCopyOverlay();
    picking = false;
    state.index = 0;
    state.plan = [];
    state.result = null;
    state.early = null;
    setPeriodClass("");
    showScreen("start");
  }

  function startDay(opt) {
    resetDayBase(opt);
    updateMeters(true);
    renderEvent();
    showScreen("event");
  }

  function goToEvent(slotIndex, opt) {
    opt = opt || {};
    resetDayBase(opt);
    var i = clamp(slotIndex == null ? 0 : slotIndex, 0, SLOTS.length - 1);
    state.index = i;
    updateMeters(true);
    renderEvent();
    showScreen("event");
  }

  function showEnding(opt) {
    opt = opt || {};
    resetDayBase(opt);
    if (opt.meters) state.meters = Object.assign({}, START_METERS, opt.meters);
    if (opt.flags) state.flags = Object.assign(emptyFlags(), opt.flags);
    state.early = opt.early || detectEarly(state.meters);
    if (opt.result) {
      state.result = opt.result;
    } else {
      state.result = computeEnding(state.meters, state.flags, state.early);
    }
    state.date = opt.date || new Date();
    if (opt.animate === true) {
      finishDay(true);
      return;
    }
    renderCurrentCard();
    setPeriodClass("evening");
    showScreen("result");
  }

  function canAutoDownload() {
    var ua = navigator.userAgent || "";
    if (/MicroMessenger/i.test(ua)) return false;
    if (/iPhone|iPad|iPod/i.test(ua)) return false;
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return false;
    return true;
  }

  function showSaveOverlay(url) {
    els.saveImg.src = url;
    els.saveOverlay.hidden = false;
  }

  function hideSaveOverlay() {
    els.saveOverlay.hidden = true;
    els.saveImg.removeAttribute("src");
  }

  function showCopyOverlay(text) {
    els.copyText.value = text;
    els.copyOverlay.hidden = false;
    setTimeout(function () {
      try {
        els.copyText.focus();
        els.copyText.select();
      } catch (e) {}
    }, 50);
  }

  function hideCopyOverlay() {
    els.copyOverlay.hidden = true;
  }

  function saveCard() {
    if (!state.result) return;
    var url;
    try {
      url = els.card.toDataURL("image/png");
    } catch (err) {
      toast("保存失败，请截屏试试");
      return;
    }
    if (!canAutoDownload()) {
      showSaveOverlay(url);
      return;
    }
    try {
      var a = document.createElement("a");
      a.href = url;
      a.download = fileNameFor(state.result, state.date);
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("已保存");
    } catch (err2) {
      showSaveOverlay(url);
    }
  }

  function copyShare() {
    if (!state.result) return;
    var text = shareText(state.result, state.date);
    var copied = false;

    function fallback() {
      showCopyOverlay(text);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          toast("已复制分享文案");
        },
        function () {
          fallback();
        }
      );
      return;
    }

    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      copied = document.execCommand("copy");
      ta.remove();
    } catch (err) {
      copied = false;
    }
    if (copied) toast("已复制分享文案");
    else fallback();
  }

  function preloadStickers() {
    var keys = Object.keys(STICKER_FILES);
    return Promise.all(
      keys.map(function (key) {
        return new Promise(function (resolve) {
          var img = new Image();
          img.onload = function () {
            images[key] = img;
            resolve(true);
          };
          img.onerror = function () {
            resolve(false);
          };
          img.src = STICKER_FILES[key];
        });
      })
    );
  }

  function bind() {
    els.btnStart.addEventListener("click", function () {
      startDay();
    });
    els.btnAgain.addEventListener("click", goToStart);
    els.btnSave.addEventListener("click", saveCard);
    els.btnShare.addEventListener("click", copyShare);
    els.btnCloseSave.addEventListener("click", hideSaveOverlay);
    els.btnCloseCopy.addEventListener("click", hideCopyOverlay);
    els.saveOverlay.addEventListener("click", function (ev) {
      if (ev.target === els.saveOverlay) hideSaveOverlay();
    });
    els.copyOverlay.addEventListener("click", function (ev) {
      if (ev.target === els.copyOverlay) hideCopyOverlay();
    });
  }

  function boot() {
    els.stage = $("stage");
    els.start = $("screen-start");
    els.event = $("screen-event");
    els.compute = $("screen-compute");
    els.result = $("screen-result");
    els.card = $("card");
    els.btnStart = $("btn-start");
    els.btnAgain = $("btn-again");
    els.btnSave = $("btn-save");
    els.btnShare = $("btn-share");
    els.saveOverlay = $("save-overlay");
    els.saveImg = $("save-img");
    els.btnCloseSave = $("btn-close-save");
    els.copyOverlay = $("copy-overlay");
    els.copyText = $("copy-text");
    els.btnCloseCopy = $("btn-close-copy");
    els.toast = $("toast");
    els.eventTime = $("event-time");
    els.eventPeriod = $("event-period");
    els.eventProgress = $("event-progress");
    els.pips = $("progress-pips");
    els.eventSticker = $("event-sticker");
    els.eventTitle = $("event-title");
    els.eventBody = $("event-body");
    els.options = $("event-options");
    els.computeSticker = $("compute-sticker");
    els.computeKicker = $("compute-kicker");
    els.computeTitle = $("compute-title");
    els.bars = {
      energy: $("bar-energy"),
      mood: $("bar-mood"),
      salary: $("bar-salary")
    };
    els.vals = {
      energy: $("val-energy"),
      mood: $("val-mood"),
      salary: $("val-salary")
    };

    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([ready, preloadStickers()]).then(function () {
      bind();
      showScreen("start");
    });
  }

  var API = {
    START_METERS: START_METERS,
    SLOTS: SLOTS,
    TITLES: TITLES,
    STICKER_FILES: STICKER_FILES,
    computeEnding: computeEnding,
    pickPlan: pickPlan,
    applyDelta: applyDelta,
    detectEarly: detectEarly,
    renderCard: renderCard,
    goToStart: goToStart,
    startDay: startDay,
    goToEvent: goToEvent,
    showEnding: showEnding,
    shareText: shareText,
    formatDate: formatDate
  };

  if (typeof window !== "undefined") {
    window.FangzaiDaka = API;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }

  if (typeof module === "object" && module.exports) {
    module.exports = API;
  }
})();
