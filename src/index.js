(function (factory) {

    //  如果在node环境
    if (typeof exports !== "undefined") {
        factory(exports)
        return
    }
    window.CA = factory({})
}(function (CA) {
    function $(query) {
        if (!query) throw "请传入选择器参数"
        if (typeof query !== "string") {
            return query
        }
        const $node = document.querySelectorAll(query)
        return $node
    }
    //  工具方法
    const tools = {
        /**
         * 把 obje2对象 的属性 赋值给obj1对象中
         */
        extend(obj1, obj2) {
            for (const property in obj2) {
                obj1[property] = obj2[property]
            }
        },
        /**
         * 循环 把list中的item 传入 callback调用
         * @param {likeArray | Array} list 列表
         */
        each(list, callback) {
            if (typeof list.length === "number") {
                list = Array.apply(null, list)
            }
            list.forEach((item, index) => {
                callback.call(item, index, item)
            })
        },
        /**
         * 驼峰命名 转换成 “串串” 命名
         * 例如 WebkitTransform 转 -webkit-transform
         */
        beHyphenize(str) {
            return str.replace(/([A-Z])g/, "-$1").toLowerCase()
        },
        /**
         * 首字母大写
         */
        beFirstToUpper(str) {
            //  匹配到首字符后 转换成大写
            return str.replace(/\b(\w)|\s(\w)/g, s => {
                return s.toUpperCase()
            })
        },
    }
    //  浏览器兼容, 补全 动画事件，
    const browser = function () {
        let prefix = ""
        const EVENT = {
            ANI_START: "animationstrat",
            ANI_REPEAT: "animationiteration",
            ANI_END: "animationend",
            TRANS_END: "transitionend",
        }

        const $div = document.createElement("div")
        const prefixs = ["Webkit", "Moz", "Mz", "O"]

        //  找到浏览器的事件名称
        for (const _prefix of prefixs) {
            if (`${_prefix}Transition` in $div.style) {
                if (prefix != "Moz") {
                    prefix = _prefix
                    const _prefixUpper = _prefix.toLowerCase()
                    EVENT.ANI_START = `${_prefixUpper}AnimationStart`
                    EVENT.ANI_REPEAT = `${_prefixUpper}AnimationIteration`
                    EVENT.ANI_END = `${_prefixUpper}AnimationEnd`
                    EVENT.TRANS_END = `${_prefixUpper}TransitionEnd`
                }
                break
            }
        }
        //  给字符串添加浏览器前缀
        function addBrowserPrefix(str) {
            if (str) {
                return `${prefix}${tools.beFirstToUpper(str)}`
            }
            return str
        }
        //  动画帧对象
        const requestAniFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame
        return {
            EVENT,
            addBrowserPrefix,
            requestAniFrame,
        }
    }()
    //  操作节点相关函数
    const node = {
        /**
         * $node 是否有 name css名
         * @param {dom Object} $node dom对象
         * @param {string} name style 名
         */
        hasCssName($node, name) {
            if ($node.style[name] != undefined) return name

            name = browser.addBrowserPrefix(name)
            if ($node.style[name] != undefined) return name
        },
        /**
         * 累加 tarVal 的值
         * @param {number} tarVal 原来的值 
         * @param {string} val 累加的值 运算符+值 +=10
         */
        cumsum(tarVal, val) {
            if (typeof val !== "string") return val

            tarVal = parseFloat(tarVal)
            let prefix = val.substr(0, 2) //  运算符
            let number = parseFloat(val.substr(2)) //  值

            switch (prefix) {
                case "+=":
                    val = tarVal + number
                    break;
                case "-=":
                    val = tarVal - number
                    break;
            }
            return val
        },
        /**
         * 检测 css 的值
         * name不是case中的css加上px后缀
         * @param {string} name css name
         * @param {number} val value
         */
        checkCssVal(name, val) {
            switch (name) {
                case "opacity":
                case "fontWeight":
                case "lineHeight":
                case "zoom":
                    return val
                default:
                    return typeof (val) === "number" ? `${Math.round(value)}px` : val
            }
        },
        /**
         * 获取 $node 的 style name的名称
         * @param {string} name dom对象的 style 名称
         */
        getStyle($node, name) {
            if ($node.currentStyle) {
                return $node.currentStyle[name]
            }
            if (document.defaultView && document.defaultView.getComputedStyle) {
                name = tools.beHyphenize(name)
                const nodeStyles = document.defaultView.getComputedStyle($node, "")
                return nodeStyles.getPropertyValue(name)
            }
        },
        /**
         * 设置 $node 的 style 样式
         * @param {object} params 样式列表
         */
        setStyle($node, params) {
            for (const name of Object.keys(params)) {
                const item = params[name]

                if ($node.style[name] != undefined) {
                    $node.style[name] = node.checkCssVal(name, item)
                }
            }
        }
    }
    //  css rule 相关函数
    const cssRule = function () {
        //  动画规则 type 值
        const keyframesRuleType = window.CSSRule.KEYFRAMES_RULE || window.CSSRule.WEBKIT_KEYFRAMES_RULE || window.CSSRule.MOZ_KEYFRAMES_RULE;
        //  style则 type 值
        const styleRuleType = window.CSSRule.STYLE_RULE || window.CSSRule.WEBKIT_STYLE_RULE || window.CSSRule.MOZ_STYLE_RULE;
        let caSheet; // css表
        let caRules; // css规则
        let ruleId = 0;

        ; (function () {
            const style = document.createElement("style")
            style.rel = "stylesheet"
            style.type = "text/css"
            $("head")[0].appendChild(style)
            caSheet = style.sheet
            caRules = caSheet.cssRules || caSheet.reles || []
        }())

        return {
            create() {
                return ++reuleId
            },
            /**
             * 给 caSheet添加 caRule规则
             * @param {str} name 规则名称
             * @param {string} content 规则内容
             */
            add(name, content) {
                //  插入sheet中的位置
                const rulesLen = caRules.length
                if (caSheet.insertRule) {
                    caSheet.insertRule(`${name}{${content}}`, rulesLen)
                }
                if (caSheet.addRule) {
                    caSheet.addRule(name, content, rulesLen)
                }
            },
            /**
             * 获取 caRules中的css规则
             * @param {string} name 规则名称
             */
            get(name) {
                for (const index of Object.keys(caRules)) {
                    const rule = caRules[index]
                    //  动画 keyframe 和 style 规则
                    if ((rule.type === keyframesRuleType && rule.name === name) ||
                        (rule.type === styleRuleType && rule.selectorText === name)) {
                        return { rule, index }
                    }
                }
            },
            /**
             * 删除 caRules中的一个规则
             * @param {*} name 
             */
            remove(name) {
                const ruleObj = cssRule.get(name)
                if (!ruleObj) return

                if (caSheet.deleteRule) {
                    caSheet.deleteRule(ruleObj.index)
                }
                if (caSheet.removeRule) {
                    caSheet.removeRule(ruleObj.index)
                }
            },
            /**
             * 添加  key frames动画
             * @param {string} name 名称
             * @param {object} from 动画开始的css规则
             * @param {object} to 动画结束的css规则
             */
            addKfRule(name, from, to) {
                name = `${ca_kf_}${name}`
                let fromText = "0%{"
                let toText = "100%{"

                for (const key of Object.keys(from)) {
                    fromText += `${tools.beHyphenize(key)}:${node.checkCssVal(key, from[key])};`
                    toText += `${tools.beHyphenize(key)}:${node.checkCssVal(key, to[key])};`
                }

                fromText += "}"
                toText += "}"

                cssRule.add(
                    `@${tools.beHyphenize(browser.addBrowserPrefix("KeyFrames"))} ${name}`,
                    fromText + toText
                )
                return name
            }
        }
    }()

    const create = function () {
        let crudeAnis = {}
        let crudeAniId = 0

        function createCrudeAni() {
            return ++crudeAniId
        }
        function CrudeAni() {
            this.init.apply(this, arguments)
        }
        tools.extend(CrudeAni.prototype, {
            init($node, time, from, to) {
                this.from = from
                this.$node = $node
                this.duration = Math.max(time, 0) // 动画时间 最小不小于0
                this.ease = `cubic-bezier${to.ease || CA.Linear.None}` // animation 的 timing-function默认为 ease
                this.delay = Math.max(to.delay || 0, 0) // 延迟一段时间后执行动画

                this.ring = to.ring || false
                this.isInfinite = to.isInfinite || false
                this.repeat = Math.floor(to.repeat || 1) // 重复次数
                this.onStart = to.onStart
                this.onRepeat = to.onRepeat
                this.onEnd = to.onEnd

                this.type = to.type || ""

                let caid = createCrudeAni()
                if (this.$node._ca_id_) {
                    crudeAnis[this.$node._ca_id_].distroy()
                }
                this.$node._ca_id_ = caid

                if (this.type === "ani") {
                    this.$node.addEventListener(browser.EVENT.ANI_START, this.onStart, false)
                    this.$node.addEventListener(browser.EVENT.ANI_REPEAT, this.onRepeat, false)
                    this.$node.addEventListener(browser.EVENT.ANI_END, this.onEnd, false)

                    const rid = cssRule.create()
                    this.kfName = cssRule.addKfRule(rid, from, to)

                    this.$node.style[browser.addBrowserPrefix("Animation")] = `${this.kfName} ${this.duration}s ${this.ease} ${this.delay}s ${(this.repeat < 0 ? 'infinite' : this.repeat)} ${this.ring ? "alternate" : "normal"}`
                    this.$node.style[browser.addBrowserPrefix("AnimationFillMode")] = "both"

                    node.setStyle(this.$node, to)
                } else {
                    this.$node.addEventListener(browser.EVENT.TRANS_END, this.onEnd, false)

                    browser.requestAniFrame(() => {
                        browser.requestAniFrame(() => {
                            this.$node.style[browser.addBrowserPrefix("Transition")] = `all ${this.duration}s ${this.ease} ${this.delay}s`
                            node.setStyle(this.$node, to)
                        })
                    })
                }

                crudeAnis[caid] = this
            },
            destory(end) {
                if (!end) {
                    for (const key of Object.keys(this.to)) {
                        if (this.$node.style[key] != undefined) {
                            this.$node.style[key] = node.getStyle(this.$node, key)
                        }
                    }
                }
                if (this.type === "ani") {
                    this.$node.removeEventListener(browser.EVENT.ANI_START, this.onStart, false)
                    this.$node.removeEventListener(browser.EVENT.ANI_REPEAT, this.onRepeat, false)
                    this.$node.removeEventListener(browser.EVENT.ANI_END, this.onEnd, false)

                    this.target.style[browserPrefix('Animation')] = "";
                    this.target.style[browserPrefix('AnimationFillMode')] = "";

                    removeRule(this.kfName);
                } else {
                    this.$node.removeEventListener(browser.EVENT.TRANS_END, this.onEnd, false)
                    this.$node.style[browserPrefix("Transition")] = ""
                }

                delete crudeAnis[this.$node._ca_id_]
                delete this.$node._ca_id_

                if (end) {
                    if (this.onEnd) {
                        this.onEnd()
                    }
                }
            }
        })
        tools.extend(CA, {
            to(query, time, to) {
                const $nodeList = $(query)
                const crudeAnis = []
                
                tools.each($nodeList, (index, $node) => {
                    const from = {}
                    const to = {}

                    for (const cssName of Object.keys(to)) {
                        const _name = node.hasCssName($node, cssName)
                    }
                })
            }
        })
    }

    return CA
})) 