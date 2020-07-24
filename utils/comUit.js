class formData {
  formData = {}
  setData = (e) => {
    for (let key in e.detail.value) {
      this.formData[key] = e.detail.value[key]
    }
  }
  getData = () => {
    return this.formData;
  }
}
class wxComUlit {
  validation = []
  regexTest = (pattern, str, TitleMsg) => {
    console.log(pattern)
    console.log(str)
    if (pattern.test(str)) {
      this.validation.push(true)
    } else {
      this.validation.push(false)
      wx.showToast({
        title: TitleMsg,
        icon: 'none'
      })
    }
  }
  unset($) {
    $.data = {}
  }
}
module.exports = {
 
  formData: new formData(),
  wxComUlit: new wxComUlit()
}