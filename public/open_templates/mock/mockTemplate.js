this.mock = {
  "list|10": [{
    "自增ID|+1": 1,
    "username|3": "重复字符串3次",
    "randomNumber|1-100": 0,
    "email": "@EMAIL",
    "randomListItem|1": ["A", "B", "C"],
    "正则": /[a-z][A-Z][0-9]/,
    "自定义字典": "@CUSTOMDICT 还有 @CUSTOMDICT",
    "randomBool|1-3": true,
    "基于Function的条件输出": (__this) => {
      if (__this.context.currentContext.randomBool) {
        return "上一个字段是TRUE"
      }
      return "上一个字段是FALSE"
    },
    "基于Function的条件输出字典值": (__this) => {
      if (__this.context.currentContext.randomBool) {
        return Mock.Random.customDict()
      }
      return "NO"
    }
  }]
}
